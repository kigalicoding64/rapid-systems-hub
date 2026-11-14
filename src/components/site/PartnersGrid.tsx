import { Link } from "@tanstack/react-router";
import { Handshake } from "lucide-react";
import type { Partner } from "@/lib/partners.functions";

export function PartnersGrid({ partners, limit }: { partners: Partner[]; limit?: number }) {
  const list = limit ? partners.slice(0, limit) : partners;
  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-card p-10 text-center">
        <Handshake className="mx-auto h-8 w-8 text-cyan-deep" aria-hidden />
        <p className="mt-4 font-display text-lg font-semibold">Partner listings coming soon</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          We only list technology and supply partners once each partnership is confirmed.
          Interested in partnering with us? <Link to="/contact" className="font-medium text-foreground underline underline-offset-4">Get in touch</Link>.
        </p>
      </div>
    );
  }
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {list.map((p) => {
        const body = (
          <>
            <div className="flex h-20 items-center justify-center rounded-lg bg-secondary/60 p-4">
              {p.logoUrl ? (
                <img src={p.logoUrl} alt={`${p.name} logo`} loading="lazy" className="max-h-12 w-auto object-contain" />
              ) : (
                <span className="font-display text-lg font-semibold">{p.name}</span>
              )}
            </div>
            <p className="mt-4 font-semibold">{p.name}</p>
            <p className="eyebrow mt-1 text-[0.65rem] text-cyan-deep">{p.partnerType}</p>
            {p.description && <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>}
          </>
        );
        return (
          <li key={p.id} className="rounded-2xl border bg-card p-5 transition-shadow hover:shadow-lift">
            {p.websiteUrl ? <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer">{body}</a> : body}
          </li>
        );
      })}
    </ul>
  );
}
