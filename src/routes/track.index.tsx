import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { FieldError } from "@/components/site/FieldError";
import { trackingTokenSchema } from "@/lib/request-schema";

export const Route = createFileRoute("/track/")({
  head: () => ({
    meta: [
      { title: "Track a Request | RAPID SYSTEMS" },
      { name: "description", content: "Check the status of a RAPID SYSTEMS quotation or consultation request using your secure tracking link." },
      { property: "og:title", content: "Track a Request | RAPID SYSTEMS" },
      { property: "og:description", content: "Check the progress of your quotation or consultation request." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrackLookupPage,
});

/** Accepts either the full tracking link or just the code at its end. */
function extractToken(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/track\/([A-Za-z0-9_-]+)/);
  return match ? match[1]! : trimmed;
}

function TrackLookupPage() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string>();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const token = extractToken(value);
    const r = trackingTokenSchema.safeParse({ token });
    if (!r.success) {
      setError("That doesn't look like a valid tracking link. Paste the full link shown when you submitted your request.");
      return;
    }
    navigate({ to: "/track/$token", params: { token } });
  };

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Request tracking"
        title="Track your request"
        description="Paste the secure tracking link you received when you submitted your request."
        crumbs={[{ label: "Track a request" }]}
      />
      <section className="container-site py-16 md:py-24">
        <form onSubmit={onSubmit} noValidate className="mx-auto max-w-2xl rounded-2xl border bg-card p-6 shadow-soft md:p-10">
          <Label htmlFor="token">Tracking link or code</Label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Input id="token" value={value} onChange={(e) => setValue(e.target.value)} aria-invalid={!!error} placeholder="https://…/track/…" />
            <Button type="submit">
              <Search className="h-4 w-4" aria-hidden="true" /> Track
            </Button>
          </div>
          <FieldError message={error} />
          <p className="mt-6 text-sm text-muted-foreground">
            Lost your link? For your security we cannot look requests up by email. Please{" "}
            <Link to="/contact" className="font-medium text-primary hover:underline">
              contact us
            </Link>{" "}
            with your reference number.
          </p>
        </form>
      </section>
    </SiteLayout>
  );
}
