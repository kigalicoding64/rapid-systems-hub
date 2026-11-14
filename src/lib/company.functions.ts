import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";

export interface CompanySettings {
  companyName: string;
  positioning: string;
  description: string;
  vision: string;
  mission: string;
  email: string;
  phones: string[];
  region: string;
}

// Mirrors the seeded company_settings row so pages still render if the read fails.
// The database row is the source of truth; edit it there.
const COMPANY_FALLBACK: CompanySettings = {
  companyName: "RAPID SYSTEMS",
  positioning: "Integrated Security · Fire Protection · Audio Visual · Smart Infrastructure",
  description:
    "East Africa's trusted technology integration partner — designing and delivering secure, compliant, and scalable systems for diplomatic missions, government institutions, financial organizations, and corporate enterprises.",
  vision:
    "To become East Africa's trusted leader in intelligent security, fire protection, audio visual, and smart infrastructure integration.",
  mission:
    "To design and deliver secure, compliant, and scalable technology, life-safety, and AV systems that enhance protection, efficiency, and operational excellence.",
  email: "rapidsystemsug@gmail.com",
  phones: ["+256 774 448 035", "+256 703 6049"],
  region: "East Africa",
};

export const getCompanySettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<CompanySettings> => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    let supabase;
    try {
      supabase = createPublicServerClient();
    } catch (e) {
      console.error(e);
      return COMPANY_FALLBACK;
    }
    const { data, error } = await supabase
      .from("company_settings")
      .select("company_name, positioning, description, vision, mission, email, phones, region")
      .eq("id", 1)
      .single();
    if (error || !data) {
      console.error("Failed to load company settings", error);
      return COMPANY_FALLBACK;
    }
    return {
      companyName: data.company_name,
      positioning: data.positioning,
      description: data.description,
      vision: data.vision,
      mission: data.mission,
      email: data.email,
      phones: data.phones,
      region: data.region,
    };
  },
);

export const companyQueryOptions = () =>
  queryOptions({
    queryKey: ["company-settings"],
    queryFn: () => getCompanySettings(),
    staleTime: 5 * 60 * 1000,
  });
