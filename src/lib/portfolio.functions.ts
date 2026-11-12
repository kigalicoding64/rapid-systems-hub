import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";

export interface PortfolioProject {
  slug: string;
  title: string;
  industry: string;
  location: string;
  serviceCategory: string;
  description: string;
  technologies: string[];
  imageUrls: string[];
  completionStatus: "planned" | "in_progress" | "completed";
}

/** Only entries an administrator has published are visible (enforced by RLS). */
export const getPublishedProjects = createServerFn({ method: "GET" }).handler(
  async (): Promise<PortfolioProject[]> => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const { data, error } = await createPublicServerClient()
      .from("portfolio_projects")
      .select("slug, title, industry, location, service_category, description, technologies, image_urls, completion_status")
      .eq("is_published", true)
      .order("published_at", { ascending: false, nullsFirst: false });
    if (error) {
      console.error("Failed to load portfolio", error);
      throw new Error("Projects are temporarily unavailable");
    }
    return (data ?? []).map((p) => ({
      slug: p.slug,
      title: p.title,
      industry: p.industry,
      location: p.location,
      serviceCategory: p.service_category,
      description: p.description,
      technologies: p.technologies,
      imageUrls: p.image_urls,
      completionStatus: p.completion_status,
    }));
  },
);

export const portfolioQueryOptions = () =>
  queryOptions({ queryKey: ["portfolio", "published"], queryFn: () => getPublishedProjects() });
