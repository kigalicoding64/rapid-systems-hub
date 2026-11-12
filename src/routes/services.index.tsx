import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { DivisionCard } from "@/components/site/DivisionCard";
import { Reveal } from "@/components/site/Reveal";
import { CtaBand } from "@/components/site/CtaBand";
import { DIVISIONS } from "@/lib/site-content";
import heroImg from "@/assets/service-smart.jpg";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Services — Security, Fire Safety, AV & Smart Buildings | RAPID SYSTEMS" },
      {
        name: "description",
        content:
          "Four integrated service divisions: security systems, fire and life safety, audio visual, and smart buildings and ICT infrastructure.",
      },
      { property: "og:title", content: "Services | RAPID SYSTEMS" },
      {
        property: "og:description",
        content: "Security systems, fire and life safety, audio visual, and smart buildings and ICT — designed to work together.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Services"
        title="Four service divisions, engineered as one."
        description="From the cable in the ceiling to the screen in the boardroom, every system we deliver is planned with the others in mind."
        crumbs={[{ label: "Services" }]}
        image={heroImg}
        imageAlt="Data centre with structured cabling"
      />
      <section className="container-site py-20 md:py-24">
        <div className="grid gap-6 md:grid-cols-2">
          {DIVISIONS.map((d, i) => (
            <Reveal key={d.slug} delay={i * 80}>
              <DivisionCard division={d} />
            </Reveal>
          ))}
        </div>
      </section>
      <CtaBand />
    </SiteLayout>
  );
}
