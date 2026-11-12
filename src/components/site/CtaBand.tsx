import { Link } from "@tanstack/react-router";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DivisionSlug } from "@/lib/site-content";
import { CircuitLines } from "./CircuitLines";

export function CtaBand({
  title = "Plan your next installation with an engineering team.",
  description = "Tell us about your site and requirements. We will review your request, arrange an assessment where needed and prepare an itemised proposal.",
  service,
}: {
  title?: string | undefined;
  description?: string | undefined;
  service?: DivisionSlug | undefined;
}) {
  return (
    <section className="container-site py-20 md:py-28">
      <div className="dark relative isolate overflow-hidden rounded-2xl border bg-background px-6 py-12 text-foreground md:px-14 md:py-16">
        <div className="grid-lines absolute inset-0 -z-10 opacity-70" aria-hidden="true" />
        <CircuitLines className="absolute -right-16 -bottom-10 -z-10 w-[520px] opacity-60" />
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div>
            <p className="eyebrow text-cyan">Consultation</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">{title}</h2>
            <p className="mt-4 max-w-xl text-muted-foreground">{description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <Button asChild size="lg">
              <Link to="/request-quote" search={{ type: "consultation", service }}>
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                Request a Consultation
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/request-quote" search={{ type: "quotation", service }}>
                Request a Quotation
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
