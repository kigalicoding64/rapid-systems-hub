import { createServerFn } from "@tanstack/react-start";
import { SUBMISSIONS_PER_EMAIL_PER_HOUR, contactEnquirySchema } from "./request-schema";

export const submitContactEnquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => contactEnquirySchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.website) throw new Error("Your message could not be sent. Please try again.");

    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("contact_enquiries")
      .select("id", { count: "exact", head: true })
      .eq("email", data.email)
      .gte("created_at", since);
    if ((count ?? 0) >= SUBMISSIONS_PER_EMAIL_PER_HOUR) {
      throw new Error("You have sent several messages in the last hour. Please wait before sending another.");
    }

    const { error } = await supabaseAdmin.from("contact_enquiries").insert({
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      organization: data.organization ?? null,
      subject: data.subject,
      message: data.message,
    });
    if (error) {
      console.error("contact_enquiries insert failed", error);
      throw new Error("We could not send your message right now. Please try again.");
    }
    return { ok: true as const };
  });
