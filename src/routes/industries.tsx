import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Banknote, Briefcase, Building, Check, Landmark, Presentation, Server } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { CtaBand } from "@/components/site/CtaBand";
import { DivisionIcon } from "@/components/site/DivisionIcon";
import { INDUSTRIES, getDivision } from "@/lib/site-content";
import heroImg from "@/assets/hero-infrastructure.jpg";

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: "Industries Served — Diplomatic, Government, Financial & Corporate | RAPID SYSTEMS" },
      {
        name: "description",
        content:
          "Integrated security, fire safety, AV and smart building systems for diplomatic missions, government, financial institutions, corporate enterprises, data centres and venues.",
      },
      { property: "og:title", content: "Industries Served | RAPID SYSTEMS" },
      {
        property: "og:description",
        content: "Sector-specific integrated technology for diplomatic missions, government, finance, enterprise, data centres and venues.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IndustriesPage,
});

const ICONS = {
  "diplomatic-missions": Landmark,
  government: Building,
  financial: Banknote,
  corporate: Briefcase,
  "data-centres": Server,
  venues: Presentation,
} as const;

function IndustriesPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Industries"
        title="Designed around the realities of each sector."
        description="Different organisations face different risks. We start with your operating environment and design the systems to fit it."
        crumbs={[{ label: "Industries" }]}
        image={heroImg}
      />
      <section className="container-site py-16 md:py-24">
        <nav aria-label="Industries" className="mb-12 flex flex-wrap gap-2">
          {INDUSTRIES.map((ind) => (
            <a key={ind.id} href={`#${ind.id}`} className="rounded-full border bg-card px-4 py-2 text-sm hover:border-primary">
              {ind.name}
            </a>
          ))}
        </nav>
        <div className="space-y-6">
          {INDUSTRIES.map((ind) => {
            const Icon = ICONS[ind.id as keyof typeof ICONS];
            return (
              <Reveal
                key={ind.id}
                as="article"
                className="scroll-mt-28 grid gap-8 rounded-2xl border bg-card p-7 shadow-soft md:grid-cols-[1.1fr_1fr] md:p-10"
              >
                <div id={ind.id} className="scroll-mt-28">
                  <Icon className="h-8 w-8 text-cyan-deep" strokeWidth={1.4} aria-hidden="true" />
                  <h2 className="mt-5 text-2xl font-semibold md:text-3xl">{ind.name}</h2>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{ind.summary}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {ind.divisions.map((slug) => (
                      <Link
                        key={slug}
                        to="/services/$slug"
                        params={{ slug }}
                        className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-accent"
                      >
                        <DivisionIcon slug={slug} className="h-3.5 w-3.5" />
                        {getDivision(slug).name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="eyebrow text-cyan-deep">Typical priorities</p>
                  <ul className="mt-4 space-y-3">
                    {ind.priorities.map((p) => (
                      <li key={p} className="flex gap-3 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-deep" aria-hidden="true" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/request-quote"
                    search={{ type: "consultation", service: ind.divisions[0] }}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    Discuss your requirements <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
      <CtaBand />
    </SiteLayout>
  );
}
