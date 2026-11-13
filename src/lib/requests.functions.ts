import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  MAX_ATTACHMENTS,
  attachmentMetaSchema,
  serviceRequestSchema,
  trackingTokenSchema,
} from "./request-schema";

export interface SubmitRequestResult {
  id?: string;
  reference: string;
  trackingToken: string;
  uploads: { index: number; path: string; token: string }[];
}

export const submitServiceRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => serviceRequestSchema.parse(data))
  .handler(async ({ data }): Promise<SubmitRequestResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { createServiceRequest } = await import("./requests.server");
    const created = await createServiceRequest(supabaseAdmin, data);
    // Guests never receive the internal id.
    return { reference: created.reference, trackingToken: created.trackingToken, uploads: created.uploads };
  });

/** Signed-in submission: the request is linked to the caller's account and organisation. */
export const submitClientRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => serviceRequestSchema.parse(data))
  .handler(async ({ data, context }): Promise<SubmitRequestResult> => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", context.userId)
      .maybeSingle();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { createServiceRequest } = await import("./requests.server");
    return createServiceRequest(supabaseAdmin, data, {
      userId: context.userId,
      organizationId: profile?.organization_id ?? null,
    });
  });

/** Short-lived download link for a request file; RLS on the caller's own client decides access first. */
export const getAttachmentDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ attachmentId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: file } = await context.supabase
      .from("request_attachments")
      .select("storage_path, file_name")
      .eq("id", data.attachmentId)
      .maybeSingle();
    if (!file) throw new Error("File not found");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { REQUEST_BUCKET } = await import("./requests.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from(REQUEST_BUCKET)
      .createSignedUrl(file.storage_path, 60, { download: file.file_name });
    if (error || !signed) throw new Error("Could not prepare the download");
    return { url: signed.signedUrl };
  });

const confirmSchema = trackingTokenSchema.extend({
  files: z
    .array(attachmentMetaSchema.extend({ path: z.string().min(10).max(400) }))
    .min(1)
    .max(MAX_ATTACHMENTS),
});

/** Records attachments the guest uploaded through the signed URLs issued at submission. */
export const confirmRequestAttachments = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => confirmSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { hashToken, REQUEST_BUCKET } = await import("./requests.server");

    const { data: request } = await supabaseAdmin
      .from("service_requests")
      .select("id")
      .eq("tracking_token_hash", await hashToken(data.token))
      .maybeSingle();
    if (!request) throw new Error("Request not found");

    const { data: objects, error: listError } = await supabaseAdmin.storage
      .from(REQUEST_BUCKET)
      .list(request.id, { limit: 100 });
    if (listError) throw new Error("Could not verify uploaded files");
    const present = new Set((objects ?? []).map((o) => `${request.id}/${o.name}`));

    const rows = data.files
      .filter((f) => f.path.startsWith(`${request.id}/`) && present.has(f.path))
      .map((f) => ({
        request_id: request.id,
        category: f.category,
        storage_path: f.path,
        file_name: f.name,
        mime_type: f.type,
        size_bytes: f.size,
      }));
    if (rows.length === 0) return { recorded: 0 };

    const { error } = await supabaseAdmin
      .from("request_attachments")
      .upsert(rows, { onConflict: "storage_path", ignoreDuplicates: true });
    if (error) throw new Error("Could not record uploaded files");
    return { recorded: rows.length };
  });

export interface TrackedRequest {
  reference: string;
  requestType: "quotation" | "consultation";
  status: string;
  serviceCategory: string;
  subcategory: string;
  projectTitle: string;
  siteCity: string;
  siteCountry: string;
  contactName: string;
  organizationName: string | null;
  submittedAt: string;
  updatedAt: string;
  events: { status: string; note: string | null; at: string }[];
  attachments: { name: string; category: string; at: string }[];
}

/** Public tracking: the unguessable token is the only key; no internal ids or private notes are returned. */
export const getTrackedRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => trackingTokenSchema.parse(data))
  .handler(async ({ data }): Promise<TrackedRequest | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { hashToken } = await import("./requests.server");

    const { data: request } = await supabaseAdmin
      .from("service_requests")
      .select(
        "id, reference, request_type, status, service_category, subcategory, project_title, site_city, site_country, contact_name, organization_name, created_at, updated_at",
      )
      .eq("tracking_token_hash", await hashToken(data.token))
      .maybeSingle();
    if (!request) return null;

    const [{ data: events }, { data: files }] = await Promise.all([
      supabaseAdmin
        .from("request_status_events")
        .select("status, note, created_at")
        .eq("request_id", request.id)
        .eq("client_visible", true)
        .order("created_at", { ascending: true }),
      supabaseAdmin
        .from("request_attachments")
        .select("file_name, category, created_at")
        .eq("request_id", request.id)
        .order("created_at", { ascending: true }),
    ]);

    return {
      reference: request.reference,
      requestType: request.request_type,
      status: request.status,
      serviceCategory: request.service_category,
      subcategory: request.subcategory,
      projectTitle: request.project_title,
      siteCity: request.site_city,
      siteCountry: request.site_country,
      contactName: request.contact_name,
      organizationName: request.organization_name,
      submittedAt: request.created_at,
      updatedAt: request.updated_at,
      events: (events ?? []).map((e) => ({ status: e.status, note: e.note, at: e.created_at })),
      attachments: (files ?? []).map((f) => ({ name: f.file_name, category: f.category, at: f.created_at })),
    };
  });
