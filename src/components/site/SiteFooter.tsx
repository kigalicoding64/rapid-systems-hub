import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Mail, MapPin, Phone } from "lucide-react";
import { companyQueryOptions } from "@/lib/company.functions";
import { DIVISIONS } from "@/lib/site-content";
import { BrandMark } from "./BrandMark";

export function SiteFooter() {
  const { data: company } = useSuspenseQuery(companyQueryOptions());
  const year = new Date().getFullYear();

  return (
    <footer className="dark relative bg-background text-foreground">
      <div className="grid-lines absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="container-site relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <BrandMark name={company.companyName} />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">{company.description}</p>
          <p className="eyebrow mt-6 text-cyan">{company.positioning}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Services</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {DIVISIONS.map((d) => (
              <li key={d.slug}>
                <Link to="/services/$slug" params={{ slug: d.slug }} className="transition-colors hover:text-foreground">
                  {d.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Company</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/solutions" className="hover:text-foreground">Solutions</Link></li>
            <li><Link to="/industries" className="hover:text-foreground">Industries</Link></li>
            <li><Link to="/projects" className="hover:text-foreground">Projects</Link></li>
            <li><Link to="/our-process" className="hover:text-foreground">Our Process</Link></li>
            <li><Link to="/track" className="hover:text-foreground">Track a request</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>
              <a href={`mailto:${company.email}`} className="flex items-start gap-3 hover:text-foreground">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
                {company.email}
              </a>
            </li>
            {company.phones.map((p) => (
              <li key={p}>
                <a href={`tel:${p.replace(/\s+/g, "")}`} className="flex items-start gap-3 hover:text-foreground">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
                  {p}
                </a>
              </li>
            ))}
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
              Serving {company.region}
            </li>
          </ul>
        </div>
      </div>
      <div className="relative border-t">
        <div className="container-site flex flex-col gap-2 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {year} {company.companyName}. All rights reserved.</p>
          <p>Integrated Security · Fire Protection · Audio Visual · Smart Infrastructure</p>
        </div>
      </div>
    </footer>
  );
}
