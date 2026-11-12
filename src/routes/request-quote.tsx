import { createFileRoute } from "@tanstack/react-router";
import { Clock, FileCheck2, Lock } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { RequestWizard } from "@/components/request/RequestWizard";
import { REQUEST_TYPES, type RequestType } from "@/lib/request-schema";
import { SUBCATEGORIES, isDivisionSlug, type DivisionSlug } from "@/lib/site-content";

interface RequestSearch {
  type?: RequestType | undefined;
  service?: DivisionSlug | undefined;
  subcategory?: string | undefined;
}

export const Route = createFileRoute("/request-quote")({
  validateSearch: (search: Record<string, unknown>): RequestSearch => {
    const type = (REQUEST_TYPES as readonly unknown[]).includes(search["type"]) ? (search["type"] as RequestType) : undefined;
    const service = isDivisionSlug(search["service"]) ? search["service"] : undefined;
    const subcategory =
      service && typeof search["subcategory"] === "string" && SUBCATEGORIES[service].includes(search["subcategory"])
        ? search["subcategory"]
        : undefined;
    return { type, service, subcategory };
  },
  head: () => ({
    meta: [
      { title: "Request a Quotation or Site Assessment | RAPID SYSTEMS" },
      {
        name: "description",
        content:
          "Submit a quotation or technical consultation request for security, fire safety, audio visual or smart building systems. Receive a reference number and secure tracking link.",
      },
      { property: "og:title", content: "Request a Quotation | RAPID SYSTEMS" },
      { property: "og:description", content: "Tell us about your project and site — we will review it and respond with next steps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RequestQuotePage,
});

function RequestQuotePage() {
  const search = Route.useSearch();
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Request a quote"
        title="Tell us about your project."
        description="Five short steps. No account needed — you will receive a reference number and a secure link to track progress."
        crumbs={[{ label: "Request a quote" }]}
      >
        <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
          <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-cyan" aria-hidden="true" /> About 5 minutes</li>
          <li className="flex items-center gap-2"><Lock className="h-4 w-4 text-cyan" aria-hidden="true" /> Files stored privately</li>
          <li className="flex items-center gap-2"><FileCheck2 className="h-4 w-4 text-cyan" aria-hidden="true" /> Reviewed by our engineering team</li>
        </ul>
      </PageHero>
      <section className="container-site py-12 md:py-20">
        <RequestWizard initialType={search["type"]} initialService={search["service"]} initialSubcategory={search["subcategory"]} />
      </section>
    </SiteLayout>
  );
}
