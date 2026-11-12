import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle, FileText, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { getTrackedRequest } from "@/lib/requests.functions";
import {
  ATTACHMENT_CATEGORY_LABELS,
  REQUEST_STATUS_FLOW,
  REQUEST_STATUS_LABELS,
  REQUEST_TYPE_LABELS,
  trackingTokenSchema,
  type AttachmentCategory,
} from "@/lib/request-schema";
import { DIVISIONS } from "@/lib/site-content";
import { cn } from "@/lib/utils";

const trackedQuery = (token: string) =>
  queryOptions({
    queryKey: ["tracked-request", token],
    queryFn: () => (trackingTokenSchema.safeParse({ token }).success ? getTrackedRequest({ data: { token } }) : Promise.resolve(null)),
    staleTime: 30_000,
  });

export const Route = createFileRoute("/track/$token")({
  head: () => ({
    meta: [
      { title: "Request Status | RAPID SYSTEMS" },
      { name: "description", content: "Secure status page for a RAPID SYSTEMS service request." },
      { property: "og:title", content: "Request Status | RAPID SYSTEMS" },
      { property: "og:description", content: "Secure status page for a service request." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(trackedQuery(params.token));
  },
  component: TrackedRequestPage,
});

const fmt = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Kampala" }).format(new Date(iso));

function TrackedRequestPage() {
  const { token } = Route.useParams();
  const { data } = useSuspenseQuery(trackedQuery(token));

  if (!data) {
    return (
      <SiteLayout>
        <PageHero eyebrow="Request tracking" title="Request not found" crumbs={[{ label: "Track a request", to: "/track" }, { label: "Status" }]} />
        <section className="container-site py-16 md:py-24">
          <div className="mx-auto max-w-xl rounded-2xl border bg-card p-8 text-center shadow-soft">
            <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
            <p className="mt-4 text-muted-foreground">
              This tracking link is not valid. Check that you copied the full link, or contact us with your reference number.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild variant="outline"><Link to="/track">Try again</Link></Button>
              <Button asChild><Link to="/contact">Contact us</Link></Button>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  const division = DIVISIONS.find((d) => d.slug === data.serviceCategory);
  const terminal = ["rejected", "cancelled", "awaiting_information"].includes(data.status);
  const currentIndex = REQUEST_STATUS_FLOW.indexOf(data.status as (typeof REQUEST_STATUS_FLOW)[number]);

  return (
    <SiteLayout>
      <PageHero
        eyebrow={`Reference ${data.reference}`}
        title={data.projectTitle}
        description={`${REQUEST_TYPE_LABELS[data.requestType]} · ${division?.name ?? data.serviceCategory} — ${data.subcategory}`}
        crumbs={[{ label: "Track a request", to: "/track" }, { label: data.reference }]}
      >
        <Badge className="bg-cyan px-3 py-1 text-sm text-navy-deep hover:bg-cyan">{REQUEST_STATUS_LABELS[data.status] ?? data.status}</Badge>
      </PageHero>

      <section className="container-site grid gap-8 py-12 md:py-20 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border bg-card p-6 shadow-soft md:p-8">
          <h2 className="text-xl font-semibold">Progress</h2>
          {terminal ? (
            <p className="mt-4 rounded-lg border bg-secondary/50 p-4 text-sm">
              Current status: <strong>{REQUEST_STATUS_LABELS[data.status]}</strong>
              {data.status === "awaiting_information" && " — our team needs more information and will contact you."}
            </p>
          ) : (
            <ol className="mt-6 space-y-4">
              {REQUEST_STATUS_FLOW.map((s, i) => {
                const done = i < currentIndex;
                const active = i === currentIndex;
                return (
                  <li key={s} className="flex items-center gap-3 text-sm">
                    {done || active ? (
                      <CheckCircle2 className={cn("h-5 w-5", active ? "text-primary" : "text-success")} aria-hidden="true" />
                    ) : (
                      <Circle className="h-5 w-5 text-border" aria-hidden="true" />
                    )}
                    <span className={cn(active ? "font-semibold" : done ? "" : "text-muted-foreground")}>{REQUEST_STATUS_LABELS[s]}</span>
                    {active && <span className="eyebrow ml-auto text-cyan-deep">Current</span>}
                  </li>
                );
              })}
            </ol>
          )}

          <h3 className="mt-10 text-sm font-semibold">Activity</h3>
          <ul className="mt-4 space-y-3 border-l pl-5">
            {data.events.map((e, i) => (
              <li key={`${e.at}-${i}`} className="relative text-sm">
                <span className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                <p className="font-medium">{REQUEST_STATUS_LABELS[e.status] ?? e.status}</p>
                {e.note && <p className="text-muted-foreground">{e.note}</p>}
                <p className="text-xs text-muted-foreground">{fmt(e.at)}</p>
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <h2 className="text-sm font-semibold">Request summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Reference</dt><dd className="font-mono">{data.reference}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Submitted</dt><dd>{fmt(data.submittedAt)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Last updated</dt><dd>{fmt(data.updatedAt)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Contact</dt><dd className="text-right">{data.contactName}{data.organizationName ? `, ${data.organizationName}` : ""}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Site</dt><dd className="text-right">{data.siteCity}, {data.siteCountry}</dd></div>
            </dl>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <h2 className="text-sm font-semibold">Files received ({data.attachments.length})</h2>
            {data.attachments.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No files were attached.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {data.attachments.map((a, i) => (
                  <li key={`${a.name}-${i}`} className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 shrink-0 text-cyan-deep" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{a.name}</span>
                    <span className="text-xs text-muted-foreground">{ATTACHMENT_CATEGORY_LABELS[a.category as AttachmentCategory] ?? a.category}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Keep this link private — anyone with it can see this status page. Need to add information? <Link to="/contact" className="text-primary hover:underline">Contact us</Link> quoting your reference.
          </p>
        </aside>
      </section>
    </SiteLayout>
  );
}
