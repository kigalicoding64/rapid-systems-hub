import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Division } from "@/lib/site-content";
import { DivisionIcon } from "./DivisionIcon";

export function DivisionCard({ division }: { division: Division }) {
  return (
    <Link
      to="/services/$slug"
      params={{ slug: division.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-soft transition-shadow duration-300 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={division.image}
          alt={division.imageAlt}
          loading="lazy"
          width={1600}
          height={1072}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-fade-bottom opacity-70" aria-hidden="true" />
        <span className="eyebrow absolute left-5 top-5 rounded-full border border-on-navy/20 bg-navy-deep/60 px-3 py-1 text-on-navy backdrop-blur-sm">
          {division.code}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <DivisionIcon slug={division.slug} className="h-[18px] w-[18px]" />
          </span>
          <h3 className="text-lg font-semibold">{division.name}</h3>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{division.summary}</p>
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {division.offerings.map((o) => (
            <li key={o.name} className="rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
              {o.name}
            </li>
          ))}
        </ul>
        <span className="mt-auto flex items-center gap-1.5 pt-6 text-sm font-semibold text-primary">
          Explore {division.shortName.toLowerCase()}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
