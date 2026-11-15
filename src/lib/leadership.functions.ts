import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";

export interface Leader {
  id: string;
  fullName: string;
  title: string;
  bio: string;
  email: string | null;
  phone: string | null;
}

/** Published leadership entries, ordered for display. Returns an empty list if the read fails. */
export const getLeadership = createServerFn({ method: "GET" }).handler(async (): Promise<Leader[]> => {
  try {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const { data, error } = await createPublicServerClient()
      .from("leadership_profiles")
      .select("id, full_name, title, bio, email, phone")
      .eq("is_published", true)
      .order("sort_order")
      .order("full_name");
    if (error) throw error;
    return (data ?? []).map((l) => ({
      id: l.id,
      fullName: l.full_name,
      title: l.title,
      bio: l.bio,
      email: l.email,
      phone: l.phone,
    }));
  } catch (e) {
    console.error("Failed to load leadership", e);
    return [];
  }
});

export const leadershipQueryOptions = () =>
  queryOptions({ queryKey: ["leadership", "published"], queryFn: () => getLeadership(), staleTime: 5 * 60 * 1000 });
