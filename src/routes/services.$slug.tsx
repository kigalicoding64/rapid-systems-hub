import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Check, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { DivisionCard } from "@/components/site/DivisionCard";
import { DivisionIcon } from "@/components/site/DivisionIcon";
import { CtaBand } from "@/components/site/CtaBand";
import { SOLUTIONS, getDivision, isDivisionSlug } from "@/lib/site-content";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    if (!isDivisionSlug(params.slug)) throw notFound();
    return { slug: params.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Service not found | RAPID SYSTEMS" }, { name: "robots", content: "noindex" }] };
    }
    const d = getDivision(loaderData.slug);
    return {
      meta: [
        { title: `${d.name} | RAPID SYSTEMS` },
        { name: "description", content: d.summary },
        { property: "og:title", content: `${d.name} | RAPID SYSTEMS` },
        { property: "og:description", content: d.tagline },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ServicePage,
});

function ServicePage() {
  const { slug } = Route.useLoaderData();
  const d = getDivision(slug);
  const relatedSolutions = SOLUTIONS.filter((s) => s.divisions.includes(slug));

  return (
    <SiteLayout>
      <PageHero
        eyebrow={`Division ${d.code}`}
        title={d.name}
        description={d.tagline}
        crumbs={[{ label: "Services", to: "/services" }, { label: d.name }]}
        image={d.image}
        imageAlt={d.imageAlt}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/request-quote" search={{ type: "quotation", service: slug }}>
              Request a Quotation <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-transparent">
            <Link to="/request-quote" search={{ type: "consultation", service: slug }}>
              <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
              Book a site assessment
            </Link>
          </Button>
        </div>
      </PageHero>

      {/* Explanation */}
      <section className="container-site grid gap-12 py-20 md:py-24 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <Reveal>
          <SectionHeading eyebrow="The solution" title={d.summary} />
        </Reveal>
        <Reveal delay={100} className="space-y-5 text-base leading-relaxed text-foreground/85 md:text-lg">
          {d.intro.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </Reveal>
      </section>

      {/* Offerings */}
      <section className="bg-secondary/60 py-20 md:py-24">
        <div className="container-site">
          <Reveal>
            <SectionHeading eyebrow="What we deliver" title={`${d.name} capabilities`} />
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {d.offerings.map((o, i) => (
              <Reveal key={o.name} delay={(i % 2) * 80} className="rounded-xl border bg-card p-7 shadow-soft">
                <div className="flex items-start gap-4">
                  <span className="font-mono text-xs text-cyan-deep">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{o.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{o.summary}</p>
                    <Link
                      to="/request-quote"
                      search={{ type: "quotation", service: slug, subcategory: o.name }}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                    >
                      Request a quote for {o.name.split(" — ")[0]}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Applications & benefits */}
      <section className="container-site grid gap-12 py-20 md:py-24 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="eyebrow text-cyan-deep">Typical applications</p>
          <ul className="mt-6 divide-y rounded-xl border bg-card">
            {d.applications.map((a) => (
              <li key={a} className="flex items-center gap-3 px-5 py-4 text-sm">
                <DivisionIcon slug={slug} className="h-4 w-4 shrink-0 text-cyan-deep" />
                {a}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={100}>
          <p className="eyebrow text-cyan-deep">Benefits</p>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            {d.benefits.map((b) => (
              <div key={b.title}>
                <dt className="flex items-center gap-2 font-semibold">
                  <Check className="h-4 w-4 text-cyan-deep" aria-hidden="true" />
                  {b.title}
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b.text}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* Related */}
      {relatedSolutions.length > 0 && (
        <section className="dark relative isolate bg-background py-20 text-foreground md:py-24">
          <div className="grid-lines absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
          <div className="container-site">
            <Reveal>
              <SectionHeading eyebrow="Related solutions" title="Where this division fits into a wider design." />
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {relatedSolutions.slice(0, 3).map((s) => (
                <Reveal key={s.id} className="rounded-xl border bg-card/60 p-6">
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.summary}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container-site pt-20 md:pt-24">
        <Reveal>
          <SectionHeading eyebrow="Related services" title="Often delivered together" />
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {d.related.map((r) => (
            <DivisionCard key={r} division={getDivision(r)} />
          ))}
        </div>
      </section>

      <CtaBand
        service={slug}
        title={`Discuss your ${d.shortName.toLowerCase()} requirements.`}
        description="Share your site details and objectives. We will review your request and advise on the next step — an assessment visit or an itemised quotation."
      />
    </SiteLayout>
  );
}
