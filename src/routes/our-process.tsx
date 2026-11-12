import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { CtaBand } from "@/components/site/CtaBand";
import { PROCESS_STEPS } from "@/lib/site-content";
import heroImg from "@/assets/engineering-team.jpg";

export const Route = createFileRoute("/our-process")({
  head: () => ({
    meta: [
      { title: "Our Process — From Consultation to Maintenance | RAPID SYSTEMS" },
      {
        name: "description",
        content:
          "How RAPID SYSTEMS delivers: consultation, site assessment, design and proposal, procurement, installation, commissioning, handover and maintenance.",
      },
      { property: "og:title", content: "Our Process | RAPID SYSTEMS" },
      { property: "og:description", content: "A defined engineering path from first conversation to long-term support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProcessPage,
});

function ProcessPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Our process"
        title="Engineering discipline at every stage."
        description="Each engagement follows the same documented path, so you always know what has been decided, what comes next and who is responsible."
        crumbs={[{ label: "Our Process" }]}
        image={heroImg}
        imageAlt="Engineers reviewing drawings on site"
      />
      <section className="container-site py-16 md:py-24">
        <Reveal>
          <SectionHeading eyebrow="Delivery methodology" title="Eight stages, one accountable team." />
        </Reveal>
        <ol className="relative mt-14 space-y-0 border-l md:ml-4">
          {PROCESS_STEPS.map((s, i) => (
            <Reveal as="li" key={s.step} delay={i * 50} className="relative pb-12 pl-10 last:pb-0 md:pl-14">
              <span className="absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full border bg-card font-mono text-xs text-cyan-deep shadow-soft">
                {s.step}
              </span>
              <h2 className="text-xl font-semibold md:text-2xl">{s.title}</h2>
              <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>
      <CtaBand />
    </SiteLayout>
  );
}
