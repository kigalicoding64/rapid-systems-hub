import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

/** Shell for every public website page. Portal and operations areas will use their own shells. */
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only z-[60] rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="animate-page flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
