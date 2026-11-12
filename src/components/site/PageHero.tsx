import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { CircuitLines } from "./CircuitLines";

export interface Crumb {
  label: string;
  to?: "/" | "/services" | "/track";
}

/** Dark cinematic header used by inner public pages. */
export function PageHero({
  eyebrow,
  title,
  description,
  crumbs,
  image,
  imageAlt = "",
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  crumbs: Crumb[];
  image?: string;
  imageAlt?: string;
  children?: ReactNode;
}) {
  return (
    <section className="dark relative isolate overflow-hidden bg-background text-foreground">
      {image && (
        <img
          src={image}
          alt={imageAlt}
          width={1600}
          height={1072}
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-60"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-hero-overlay" aria-hidden="true" />
      <div className="grid-lines absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
      <CircuitLines className="absolute -right-10 bottom-0 -z-10 hidden w-[560px] opacity-70 lg:block" />
      <div className="container-site pb-16 pt-32 md:pb-24 md:pt-40">
        <nav aria-label="Breadcrumb" className="animate-rise">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <li>
              <Link to="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.label} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
                {c.to ? (
                  <Link to={c.to} className="transition-colors hover:text-foreground">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-foreground/80">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <p className="eyebrow mt-10 text-cyan animate-rise" style={{ animationDelay: "60ms" }}>
          {eyebrow}
        </p>
        <h1
          className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.08] md:text-6xl animate-rise"
          style={{ animationDelay: "120ms" }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground animate-rise"
            style={{ animationDelay: "180ms" }}
          >
            {description}
          </p>
        )}
        {children && (
          <div className="mt-8 animate-rise" style={{ animationDelay: "240ms" }}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
