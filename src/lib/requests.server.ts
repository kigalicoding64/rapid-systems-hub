// Server-only helpers for service requests.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { SUBMISSIONS_PER_EMAIL_PER_HOUR, type ServiceRequestData } from "./request-schema";

export const REQUEST_BUCKET = "request-attachments";

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** 256-bit random tracking token, URL-safe. Only its hash is stored. */
export function generateTrackingToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function safeFileName(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return (cleaned || "file").slice(-80);
}


export interface CreatedRequest {
  id: string;
  reference: string;
  trackingToken: string;
  uploads: { index: number; path: string; token: string }[];
}

/**
 * Validated insert shared by guest and signed-in submissions: honeypot, hourly per-email limit,
 * hashed tracking token, then signed upload URLs for each declared attachment.
 */
export async function createServiceRequest(
  admin: SupabaseClient<Database>,
  data: ServiceRequestData,
  owner?: { userId: string; organizationId: string | null },
): Promise<CreatedRequest> {
  if (data.website) throw new Error("Your request could not be submitted. Please try again.");

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await admin
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
  const { data: inserted, error } = await admin
    .from("service_requests")
    .insert({
      reference: "",
      tracking_token_hash: await hashToken(trackingToken),
      submitted_by: owner?.userId ?? null,
      organization_id: owner?.organizationId ?? null,
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

  const uploads: CreatedRequest["uploads"] = [];
  for (const [index, file] of data.attachments.entries()) {
    const path = `${inserted.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { data: signed, error: signError } = await admin.storage.from(REQUEST_BUCKET).createSignedUploadUrl(path);
    if (signError || !signed) {
      console.error("createSignedUploadUrl failed", signError);
      continue;
    }
    uploads.push({ index, path: signed.path, token: signed.token });
  }
  return { id: inserted.id, reference: inserted.reference, trackingToken, uploads };
}
