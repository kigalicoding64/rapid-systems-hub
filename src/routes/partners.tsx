import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { PartnersGrid } from "@/components/site/PartnersGrid";
import { CtaBand } from "@/components/site/CtaBand";
import { partnersQueryOptions } from "@/lib/partners.functions";
import heroImg from "@/assets/engineering-team.jpg";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Partners | RAPID SYSTEMS" },
      { name: "description", content: "Technology and supply partners working with RAPID SYSTEMS across security, AV, networking and building systems." },
      { property: "og:title", content: "Partners | RAPID SYSTEMS" },
      { property: "og:description", content: "Confirmed technology and supply partners of RAPID SYSTEMS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(partnersQueryOptions());
  },
  component: PartnersPage,
});

function PartnersPage() {
  const { data: partners } = useSuspenseQuery(partnersQueryOptions());
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Partners"
        title="Our partners"
        description="The technology manufacturers and suppliers we work with to deliver reliable, supported systems."
        crumbs={[{ label: "Partners" }]}
        image={heroImg}
        imageAlt="Engineers reviewing technical drawings"
      />
      <section className="container-site py-16 md:py-24">
        <PartnersGrid partners={partners} />
      </section>
      <CtaBand />
    </SiteLayout>
  );
}
