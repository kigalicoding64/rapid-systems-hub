import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/site/BrandMark";
import { CircuitLines } from "@/components/site/CircuitLines";

/** Split screen for sign-in pages: navy brand panel on the left, form on the right. */
export function AuthLayout({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <aside className="dark relative isolate hidden overflow-hidden bg-background p-12 text-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="grid-lines absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
        <CircuitLines className="absolute -right-16 bottom-0 -z-10 w-[560px] opacity-70" />
        <Link to="/" aria-label="RAPID SYSTEMS home" className="w-fit">
          <BrandMark />
        </Link>
        <div className="max-w-md">
          <p className="eyebrow text-cyan">Client & team access</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight">One secure place for every request, quotation and project.</h2>
          <p className="mt-4 text-muted-foreground">
            Clients follow their requests and documents. The RAPID SYSTEMS team manages the work behind them.
          </p>
        </div>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-cyan" aria-hidden="true" />
          Accounts are verified by email and access is limited by role.
        </p>
      </aside>
      <main className="flex flex-col bg-background">
        <div className="dark bg-background px-5 py-4 lg:hidden">
          <Link to="/" aria-label="RAPID SYSTEMS home">
            <BrandMark />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-12 sm:px-10">
          <div className="w-full max-w-md animate-page">
            <h1 className="text-3xl font-semibold">{title}</h1>
            {description && <p className="mt-2 text-muted-foreground">{description}</p>}
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export const GOOGLE_SANS_LINK = {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Google+Sans:wght@500&display=swap",
};
