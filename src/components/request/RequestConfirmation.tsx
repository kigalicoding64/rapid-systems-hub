import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { RequestType } from "@/lib/request-schema";

export interface ConfirmationData {
  reference: string;
  trackingToken: string;
  uploaded: number;
  failedUploads: number;
  requestType: RequestType;
  email: string;
}

export function RequestConfirmation({ data }: { data: ConfirmationData }) {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const trackingUrl = `${origin}/track/${data.trackingToken}`;

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed — please select and copy it manually.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-6 shadow-lift sm:p-10" role="status" aria-live="polite">
      <CheckCircle2 className="h-12 w-12 text-success" strokeWidth={1.5} aria-hidden="true" />
      <h2 className="mt-6 text-3xl font-semibold">Request received</h2>
      <p className="mt-3 text-muted-foreground">
        Thank you. Your {data.requestType === "quotation" ? "quotation request" : "consultation request"} has been recorded and
        will be reviewed by our team. We will contact you using the details you provided.
      </p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-secondary/50 p-5">
          <dt className="eyebrow text-muted-foreground">Reference number</dt>
          <dd className="mt-2 flex items-center justify-between gap-3">
            <span className="font-mono text-xl font-semibold tracking-wide">{data.reference}</span>
            <Button type="button" variant="ghost" size="icon" aria-label="Copy reference number" onClick={() => copy(data.reference, "Reference")}>
              <Copy className="h-4 w-4" />
            </Button>
          </dd>
        </div>
        <div className="rounded-xl border bg-secondary/50 p-5">
          <dt className="eyebrow text-muted-foreground">Files received</dt>
          <dd className="mt-2 font-mono text-xl font-semibold">{data.uploaded}</dd>
        </div>
      </dl>

      {data.failedUploads > 0 && (
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
          {data.failedUploads} file{data.failedUploads > 1 ? "s" : ""} could not be uploaded. Your request is saved — you can
          send the remaining files when our team contacts you.
        </p>
      )}

      <div className="mt-8 rounded-xl border p-5">
        <p className="font-semibold">Your secure tracking link</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Save this link. Anyone with it can view the status of this request, so keep it private. It is shown only once.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <code className="min-w-0 flex-1 truncate rounded-md border bg-secondary/50 px-3 py-2.5 font-mono text-xs">{trackingUrl}</code>
          <Button type="button" variant="outline" onClick={() => copy(trackingUrl, "Tracking link")}>
            <Copy className="h-4 w-4" aria-hidden="true" /> Copy link
          </Button>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link to="/track/$token" params={{ token: data.trackingToken }}>
            Track this request <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/">Return to homepage</Link>
        </Button>
      </div>
    </div>
  );
}
