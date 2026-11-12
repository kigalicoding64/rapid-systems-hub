import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { CtaBand } from "@/components/site/CtaBand";
import { DivisionIcon } from "@/components/site/DivisionIcon";
import { SOLUTIONS, getDivision } from "@/lib/site-content";
import heroImg from "@/assets/service-security.jpg";

export const Route = createFileRoute("/solutions")({
  head: () => ({
    meta: [
      { title: "Integrated Solutions | RAPID SYSTEMS" },
      {
        name: "description",
        content:
          "Integrated security operations, critical room protection, smart workplaces, life-safety integration and resilient network and power backbones.",
      },
      { property: "og:title", content: "Integrated Solutions | RAPID SYSTEMS" },
      {
        property: "og:description",
        content: "Solutions that combine security, fire safety, AV and building infrastructure into one coordinated design.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SolutionsPage,
});

function SolutionsPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Integrated solutions"
        title="When systems share information, buildings respond as one."
        description="Our solutions combine disciplines so that an event in one system triggers the right action in the others."
        crumbs={[{ label: "Solutions" }]}
        image={heroImg}
        imageAlt="Security operations room"
      />
      <section className="container-site py-16 md:py-24">
        <div className="grid gap-6 md:grid-cols-2">
          {SOLUTIONS.map((s, i) => (
            <Reveal key={s.id} delay={(i % 2) * 80} as="article" className="flex flex-col rounded-2xl border bg-card p-8 shadow-soft">
              <span className="font-mono text-xs text-cyan-deep">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="mt-3 text-2xl font-semibold">{s.name}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{s.summary}</p>
              <p className="eyebrow mt-6 text-muted-foreground">Components</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {s.components.map((c) => (
                  <li key={c} className="rounded-md bg-secondary px-3 py-2 text-sm">
                    {c}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-5 mt-8">
                {s.divisions.map((slug) => (
                  <Link
                    key={slug}
                    to="/services/$slug"
                    params={{ slug }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    <DivisionIcon slug={slug} className="h-3.5 w-3.5 text-cyan-deep" />
                    {getDivision(slug).name}
                  </Link>
                ))}
                <Link
                  to="/request-quote"
                  search={{ type: "consultation", service: s.divisions[0] }}
                  className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  Enquire <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <CtaBand />
    </SiteLayout>
  );
}
