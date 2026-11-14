import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";

export interface Partner {
  id: string;
  name: string;
  partnerType: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
}

/** Only partners an administrator has published are visible (enforced by RLS). */
export const getPublishedPartners = createServerFn({ method: "GET" }).handler(async (): Promise<Partner[]> => {
  try {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const { data, error } = await createPublicServerClient()
      .from("partners")
      .select("id, name, partner_type, description, logo_url, website_url")
      .eq("is_published", true)
      .order("sort_order")
      .order("name");
    if (error) throw error;
    return (data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      partnerType: p.partner_type,
      description: p.description,
      logoUrl: p.logo_url,
      websiteUrl: p.website_url,
    }));
  } catch (e) {
    console.error("Failed to load partners", e);
    return [];
  }
});

export const partnersQueryOptions = () =>
  queryOptions({ queryKey: ["partners", "published"], queryFn: () => getPublishedPartners() });
