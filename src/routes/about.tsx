import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Eye, Target } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { CtaBand } from "@/components/site/CtaBand";
import { DivisionIcon } from "@/components/site/DivisionIcon";
import { companyQueryOptions } from "@/lib/company.functions";
import { DIVISIONS, WHY_POINTS } from "@/lib/site-content";
import teamImg from "@/assets/engineering-team.jpg";
import logoAsset from "@/assets/rapid-systems-logo.png.asset.json";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About RAPID SYSTEMS — Technology Integration Partner for East Africa" },
      {
        name: "description",
        content:
          "Our vision, mission and approach to delivering secure, compliant and scalable security, fire safety, AV and smart infrastructure systems.",
      },
      { property: "og:title", content: "About RAPID SYSTEMS" },
      {
        property: "og:description",
        content: "East Africa's technology integration partner for security, life-safety, AV and smart infrastructure.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: company } = useSuspenseQuery(companyQueryOptions());

  return (
    <SiteLayout>
      <PageHero
        eyebrow="About us"
        title="Trusted integration for systems that protect people and operations."
        description={company.description}
        crumbs={[{ label: "About" }]}
        image={teamImg}
        imageAlt="Engineers reviewing drawings on a construction site"
      />

      <section className="container-site grid gap-6 py-20 md:grid-cols-2 md:py-24">
        <Reveal className="rounded-2xl border bg-card p-8 shadow-soft md:p-10">
          <Eye className="h-7 w-7 text-cyan-deep" strokeWidth={1.5} aria-hidden="true" />
          <p className="eyebrow mt-6 text-cyan-deep">Vision</p>
          <p className="mt-3 font-display text-xl font-medium leading-snug md:text-2xl">{company.vision}</p>
        </Reveal>
        <Reveal delay={100} className="rounded-2xl border bg-card p-8 shadow-soft md:p-10">
          <Target className="h-7 w-7 text-signal" strokeWidth={1.5} aria-hidden="true" />
          <p className="eyebrow mt-6 text-cyan-deep">Mission</p>
          <p className="mt-3 font-display text-xl font-medium leading-snug md:text-2xl">{company.mission}</p>
        </Reveal>
      </section>

      <section className="dark relative isolate overflow-hidden bg-background py-20 text-foreground md:py-24">
        <div className="grid-lines absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
        <div className="container-site grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              eyebrow="Our identity"
              title="Four disciplines under one identity."
              description="RAPID SYSTEMS brings security, fire and life safety, audio visual and smart infrastructure together under one engineering team and one point of accountability."
            />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {DIVISIONS.map((d) => (
                <li key={d.slug} className="flex items-center gap-3 rounded-lg border bg-card/60 px-4 py-3 text-sm">
                  <DivisionIcon slug={d.slug} className="h-4 w-4 text-cyan" />
                  {d.name}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120}>
            <img
              src={logoAsset.url}
              alt={`${company.companyName} logo`}
              width={1024}
              height={906}
              loading="lazy"
              className="w-full rounded-2xl border shadow-lift"
            />
          </Reveal>
        </div>
      </section>

      <section className="container-site py-20 md:py-24">
        <Reveal>
          <SectionHeading eyebrow="How we work" title="Principles that guide every engagement." />
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_POINTS.map((p, i) => (
            <Reveal key={p.title} delay={i * 70} className="border-t-2 border-primary pt-5">
              <h3 className="font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBand />
    </SiteLayout>
  );
}
