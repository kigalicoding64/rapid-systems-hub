import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight, Check, ClipboardCheck, Landmark, Building, Banknote, Briefcase, Server, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { CircuitLines } from "@/components/site/CircuitLines";
import { DivisionCard } from "@/components/site/DivisionCard";
import { DivisionIcon } from "@/components/site/DivisionIcon";
import { ProjectsGrid } from "@/components/site/ProjectsGrid";
import { CtaBand } from "@/components/site/CtaBand";
import { companyQueryOptions } from "@/lib/company.functions";
import { portfolioQueryOptions } from "@/lib/portfolio.functions";
import { DIVISIONS, INDUSTRIES, PROCESS_STEPS, SOLUTIONS, WHY_POINTS } from "@/lib/site-content";
import heroImg from "@/assets/hero-infrastructure.jpg";
import teamImg from "@/assets/engineering-team.jpg";
import logoAsset from "@/assets/rapid-systems-logo-framed.webp.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RAPID SYSTEMS — Intelligent Infrastructure. Integrated Protection." },
      {
        name: "description",
        content:
          "Security systems, fire and life safety, audio visual and smart building infrastructure — designed and delivered across East Africa by RAPID SYSTEMS.",
      },
      { property: "og:title", content: "RAPID SYSTEMS — Intelligent Infrastructure. Integrated Protection." },
      {
        property: "og:description",
        content:
          "East Africa's technology integration partner for diplomatic missions, government, financial institutions and corporate enterprises.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(portfolioQueryOptions());
  },
  component: HomePage,
});

const INDUSTRY_ICONS = {
  "diplomatic-missions": Landmark,
  government: Building,
  financial: Banknote,
  corporate: Briefcase,
  "data-centres": Server,
  venues: Presentation,
} as const;

function HomePage() {
  const { data: company } = useSuspenseQuery(companyQueryOptions());
  const { data: projects } = useSuspenseQuery(portfolioQueryOptions());

  return (
    <SiteLayout>
      {/* 1. Hero */}
      <section className="dark relative isolate min-h-[100svh] overflow-hidden bg-background text-foreground">
        <img
          src={heroImg}
          alt="Modern corporate headquarters at dusk with integrated security camera"
          width={1920}
          height={1088}
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 -z-10 bg-hero-overlay" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-fade-bottom" aria-hidden="true" />
        <div className="grid-lines absolute inset-0 -z-10 opacity-50" aria-hidden="true" />
        <CircuitLines className="absolute -left-20 bottom-24 -z-10 hidden w-[620px] opacity-60 md:block" />

        <div className="container-site grid min-h-[100svh] items-center gap-12 pb-28 pt-32 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <p className="eyebrow animate-rise text-cyan">{company.positioning}</p>
            <h1
              className="mt-6 text-[2.6rem] font-semibold leading-[1.04] animate-rise sm:text-6xl lg:text-[4.25rem]"
              style={{ animationDelay: "80ms" }}
            >
              Intelligent Infrastructure.
              <span className="block text-cyan">Integrated Protection.</span>
            </h1>
            <p
              className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground animate-rise"
              style={{ animationDelay: "160ms" }}
            >
              We design and deliver security systems, fire and life safety, audio visual and smart building
              infrastructure as one coordinated environment — for organisations that cannot afford gaps between
              their systems.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row animate-rise" style={{ animationDelay: "240ms" }}>
              <Button asChild size="lg" className="h-12 px-6">
                <Link to="/request-quote" search={{ type: "consultation" }}>
                  <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                  Request a Consultation
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 bg-transparent px-6">
                <Link to="/solutions">
                  Explore Our Solutions
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative hidden lg:block animate-rise" style={{ animationDelay: "200ms" }}>
            <figure className="mx-auto max-w-[480px] overflow-hidden rounded-2xl border border-on-navy/10 shadow-lift">
              <img
                src={logoAsset.url}
                alt={`${company.companyName} logo`}
                width={740}
                height={580}
                className="block w-full"
              />
            </figure>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 hidden border-t border-on-navy/10 bg-navy-deep/70 backdrop-blur-sm md:block">
          <ul className="container-site grid grid-cols-2 md:grid-cols-4">
            {DIVISIONS.map((d, i) => (
              <li key={d.slug} className={i > 0 ? "md:border-l md:border-on-navy/10" : ""}>
                <Link
                  to="/services/$slug"
                  params={{ slug: d.slug }}
                  className="group flex items-center gap-3 px-2 py-5 text-sm text-on-navy-muted transition-colors hover:text-on-navy md:px-6"
                >
                  <DivisionIcon slug={d.slug} className="h-4 w-4 shrink-0 text-cyan" />
                  <span className="font-medium">{d.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 2. Trust & positioning */}
      <section className="relative">
        <div className="grid-lines-light absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="container-site relative grid gap-12 py-20 md:py-28 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <Reveal>
            <SectionHeading eyebrow="Who we are" title="A technology integration partner built for critical environments." />
          </Reveal>
          <Reveal delay={100}>
            <p className="text-lg leading-relaxed text-foreground/85 md:text-xl">{company.description}</p>
            <dl className="mt-10 grid gap-6 border-t pt-8 sm:grid-cols-2">
              <div>
                <dt className="eyebrow text-cyan-deep">Vision</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{company.vision}</dd>
              </div>
              <div>
                <dt className="eyebrow text-cyan-deep">Mission</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{company.mission}</dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      {/* 3. Four divisions */}
      <section className="bg-secondary/60 py-20 md:py-28">
        <div className="container-site">
          <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Core service divisions"
              title="Four disciplines. One accountable team."
              description="Each division is specialised in its own right — and designed to integrate with the others."
            />
            <Button asChild variant="outline">
              <Link to="/services">
                All services <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {DIVISIONS.map((d, i) => (
              <Reveal key={d.slug} delay={i * 80}>
                <DivisionCard division={d} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Integrated solutions */}
      <section className="container-site py-20 md:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Integrated solutions"
            title="Systems that work together, not side by side."
            description="Our solutions combine disciplines so that detection, response, communication and infrastructure behave as one."
          />
        </Reveal>
        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-2 lg:grid-cols-3">
          {SOLUTIONS.map((s, i) => (
            <Reveal key={s.id} delay={(i % 3) * 80} className="bg-card p-7">
              <div className="flex gap-1.5">
                {s.divisions.map((slug) => (
                  <DivisionIcon key={slug} slug={slug} className="h-4 w-4 text-cyan-deep" />
                ))}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.summary}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-8">
          <Link to="/solutions" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            View solution details <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 5. Industries */}
      <section className="dark relative isolate overflow-hidden bg-background py-20 text-foreground md:py-28">
        <div className="grid-lines absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
        <div className="container-site">
          <Reveal>
            <SectionHeading
              eyebrow="Industries served"
              title="Engineered for organisations with high expectations."
              description="Each sector has its own risk profile, compliance requirements and operating rhythm. Our designs start there."
            />
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.map((ind, i) => {
              const Icon = INDUSTRY_ICONS[ind.id as keyof typeof INDUSTRY_ICONS];
              return (
                <Reveal key={ind.id} delay={(i % 3) * 80}>
                  <Link
                    to="/industries"
                    hash={ind.id}
                    className="group flex h-full flex-col rounded-xl border bg-card/60 p-6 transition-colors hover:border-cyan/40 hover:bg-card"
                  >
                    <Icon className="h-6 w-6 text-cyan" strokeWidth={1.5} aria-hidden="true" />
                    <h3 className="mt-5 text-base font-semibold">{ind.name}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{ind.summary}</p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Methodology */}
      <section className="container-site py-20 md:py-28">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Engineering & delivery"
            title="A defined path from first conversation to long-term support."
          />
          <Button asChild variant="outline">
            <Link to="/our-process">
              Our process <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </Reveal>
        <ol className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((s, i) => (
            <Reveal as="li" key={s.step} delay={(i % 4) * 70} className="border-t pt-5">
              <span className="font-mono text-xs text-cyan-deep">{s.step}</span>
              <h3 className="mt-2 text-base font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* 7. Selected projects */}
      <section className="bg-secondary/60 py-20 md:py-28">
        <div className="container-site">
          <Reveal>
            <SectionHeading eyebrow="Selected projects" title="Delivery you can verify." />
          </Reveal>
          <div className="mt-12">
            <ProjectsGrid projects={projects} limit={3} />
          </div>
        </div>
      </section>

      {/* 8. Why Rapid Systems */}
      <section className="container-site grid items-center gap-12 py-20 md:py-28 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative">
          <img
            src={teamImg}
            alt="Engineers reviewing technical drawings on site"
            loading="lazy"
            width={1600}
            height={1072}
            className="aspect-[4/3] w-full rounded-2xl object-cover shadow-lift"
          />
          <div className="absolute -bottom-5 -right-3 hidden rounded-xl border bg-card px-5 py-4 shadow-lift sm:block">
            <p className="eyebrow text-cyan-deep">Serving</p>
            <p className="mt-1 font-display text-lg font-semibold">{company.region}</p>
          </div>
        </Reveal>
        <div>
          <Reveal>
            <SectionHeading eyebrow={`Why ${company.companyName}`} title="Integration is a discipline, not a product." />
          </Reveal>
          <ul className="mt-10 space-y-7">
            {WHY_POINTS.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 70} className="flex gap-4">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 9. Consultation CTA */}
      <CtaBand />
    </SiteLayout>
  );
}
