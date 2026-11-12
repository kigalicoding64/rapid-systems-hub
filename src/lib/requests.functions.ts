import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  MAX_ATTACHMENTS,
  SUBMISSIONS_PER_EMAIL_PER_HOUR,
  attachmentMetaSchema,
  serviceRequestSchema,
  trackingTokenSchema,
} from "./request-schema";

export interface SubmitRequestResult {
  reference: string;
  trackingToken: string;
  uploads: { index: number; path: string; token: string }[];
}

export const submitServiceRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => serviceRequestSchema.parse(data))
  .handler(async ({ data }): Promise<SubmitRequestResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { generateTrackingToken, hashToken, safeFileName, REQUEST_BUCKET } = await import(
      "./requests.server"
    );

    // Honeypot filled: reject without storing anything.
    if (data.website) {
      throw new Error("Your request could not be submitted. Please try again.");
    }

    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabaseAdmin
      .from("service_requests")
      .select("id", { count: "exact", head: true })
      .eq("email", data.client.email)
      .gte("created_at", since);
    if (countError) throw new Error("We could not submit your request right now. Please try again.");
    if ((count ?? 0) >= SUBMISSIONS_PER_EMAIL_PER_HOUR) {
      throw new Error(
        "We have received several requests from this email address in the last hour. Please wait before submitting another, or contact us directly.",
      );
    }

    const trackingToken = generateTrackingToken();
    const tokenHash = await hashToken(trackingToken);

    const { data: inserted, error } = await supabaseAdmin
      .from("service_requests")
      .insert({
        reference: "",
        tracking_token_hash: tokenHash,
        request_type: data.requestType,
        client_type: data.client.clientType,
        organization_name: data.client.clientType === "organization" ? (data.client.organizationName ?? null) : null,
        contact_name: data.client.contactName,
        email: data.client.email,
        phone: data.client.phone,
        country: data.client.country,
        preferred_channel: data.client.preferredChannel,
        service_category: data.service.serviceCategory,
        subcategory: data.service.subcategory,
        project_title: data.service.projectTitle,
        description: data.service.description,
        facility_type: data.service.facilityType,
        project_size: data.service.projectSize ?? null,
        site_country: data.site.siteCountry,
        site_city: data.site.siteCity,
        site_address: data.site.siteAddress ?? null,
        site_type: data.site.siteType,
        installation_type: data.site.installationType,
        preferred_visit_date: data.site.preferredVisitDate ?? null,
        estimated_budget: data.additional.estimatedBudget ?? null,
        desired_completion_date: data.additional.desiredCompletionDate ?? null,
        additional_comments: data.additional.additionalComments ?? null,
        consent_given_at: new Date().toISOString(),
      })
      .select("id, reference")
      .single();

    if (error || !inserted) {
      console.error("service_requests insert failed", error);
      throw new Error("We could not submit your request right now. Please try again.");
    }

    const uploads: SubmitRequestResult["uploads"] = [];
    for (const [index, file] of data.attachments.entries()) {
      const path = `${inserted.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
      const { data: signed, error: signError } = await supabaseAdmin.storage
        .from(REQUEST_BUCKET)
        .createSignedUploadUrl(path);
      if (signError || !signed) {
        console.error("createSignedUploadUrl failed", signError);
        continue;
      }
      uploads.push({ index, path: signed.path, token: signed.token });
    }

    return { reference: inserted.reference, trackingToken, uploads };
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
