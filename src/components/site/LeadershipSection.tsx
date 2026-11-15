import { useSuspenseQuery } from "@tanstack/react-query";
import { Mail, Phone } from "lucide-react";
import { leadershipQueryOptions } from "@/lib/leadership.functions";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

/** Leadership cards from the published leadership list; hidden entirely when the list is empty. */
export function LeadershipSection() {
  const { data: leaders } = useSuspenseQuery(leadershipQueryOptions());
  if (leaders.length === 0) return null;

  return (
    <section className="border-t bg-secondary/40 py-20 md:py-24">
      <div className="container-site">
        <Reveal>
          <SectionHeading
            eyebrow="Executive leadership"
            title="Guiding vision, technical precision and engineering excellence."
          />
        </Reveal>
        <div className="mt-12 space-y-8">
          {leaders.map((l, i) => (
            <Reveal
              key={l.id}
              delay={i * 80}
              className="grid gap-8 rounded-2xl border bg-card p-6 shadow-soft md:grid-cols-[260px_1fr] md:p-10"
            >
              <div>
                <div className="dark relative isolate flex aspect-square w-full max-w-[220px] items-center justify-center overflow-hidden rounded-xl bg-background text-foreground">
                  <div className="grid-lines absolute inset-0 -z-10 opacity-70" aria-hidden="true" />
                  <span className="font-display text-6xl font-semibold tracking-tight text-cyan" aria-hidden="true">
                    {initials(l.fullName)}
                  </span>
                </div>
                {(l.email || l.phone) && (
                  <ul className="mt-6 space-y-2 text-sm">
                    {l.email && (
                      <li>
                        <a href={`mailto:${l.email}`} className="flex items-center gap-2 break-all hover:text-primary">
                          <Mail className="h-4 w-4 shrink-0 text-cyan-deep" aria-hidden="true" />
                          {l.email}
                        </a>
                      </li>
                    )}
                    {l.phone && (
                      <li>
                        <a href={`tel:${l.phone.replace(/\s+/g, "")}`} className="flex items-center gap-2 hover:text-primary">
                          <Phone className="h-4 w-4 shrink-0 text-cyan-deep" aria-hidden="true" />
                          {l.phone}
                        </a>
                      </li>
                    )}
                  </ul>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-semibold md:text-3xl">{l.fullName}</h3>
                <p className="eyebrow mt-2 text-cyan-deep">{l.title}</p>
                <div className="mt-6 space-y-4 border-t pt-6 leading-relaxed text-muted-foreground">
                  {l.bio.split(/\n{2,}/).map((para, k) => (
                    <p key={k}>{para}</p>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
