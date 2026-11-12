import { useMemo, useRef, useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, Check, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { confirmRequestAttachments, submitServiceRequest } from "@/lib/requests.functions";
import {
  MAX_ATTACHMENTS,
  REQUEST_TYPE_LABELS,
  additionalInfoSchema,
  attachmentMetaSchema,
  clientDetailsSchema,
  resolveMimeType,
  serviceRequirementsSchema,
  siteInformationSchema,
  type RequestType,
} from "@/lib/request-schema";
import type { DivisionSlug } from "@/lib/site-content";
import { cn } from "@/lib/utils";
import { ChoiceCards } from "./fields";
import { AdditionalStep, ClientDetailsStep, ReviewStep, ServiceStep, SiteStep } from "./steps";
import { RequestConfirmation, type ConfirmationData } from "./RequestConfirmation";
import type { FieldErrors, RequestFormState, SelectedFile } from "./types";
import type { ZodError } from "zod";

const STEPS = [
  { title: "Client details", description: "Who should we contact about this request?" },
  { title: "Service requirements", description: "What would you like us to deliver?" },
  { title: "Site information", description: "Where is the project located?" },
  { title: "Additional information", description: "Budget, timing and supporting files." },
  { title: "Review & submit", description: "Check your request before sending." },
] as const;

const BUCKET = "request-attachments";

function initialState(type: RequestType, service?: DivisionSlug, subcategory?: string): RequestFormState {
  return {
    requestType: type,
    client: { clientType: "organization", organizationName: "", contactName: "", email: "", phone: "", country: "", preferredChannel: "email" },
    service: { serviceCategory: service ?? "", subcategory: service && subcategory ? subcategory : "", projectTitle: "", description: "", facilityType: "", projectSize: "" },
    site: { siteCountry: "", siteCity: "", siteAddress: "", siteType: "", installationType: "new", preferredVisitDate: "" },
    additional: { estimatedBudget: "", desiredCompletionDate: "", additionalComments: "" },
    files: [],
    consent: false,
    website: "",
  };
}

function collect(prefix: string, error: ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = `${prefix}.${issue.path.join(".")}`;
    out[key] ??= issue.message;
  }
  return out;
}

function validateFiles(files: SelectedFile[]): string | undefined {
  if (files.length > MAX_ATTACHMENTS) return `Attach up to ${MAX_ATTACHMENTS} files`;
  for (const f of files) {
    const r = attachmentMetaSchema.safeParse({
      category: f.category,
      name: f.file.name,
      type: resolveMimeType(f.file.name, f.file.type),
      size: f.file.size,
    });
    if (!r.success) return `${f.file.name}: ${r.error.issues[0]?.message ?? "invalid file"}`;
  }
  return undefined;
}

function validateStep(step: number, s: RequestFormState): FieldErrors {
  switch (step) {
    case 0: {
      const r = clientDetailsSchema.safeParse(s.client);
      return r.success ? {} : collect("client", r.error);
    }
    case 1: {
      const r = serviceRequirementsSchema.safeParse(s.service);
      return r.success ? {} : collect("service", r.error);
    }
    case 2: {
      const r = siteInformationSchema.safeParse(s.site);
      return r.success ? {} : collect("site", r.error);
    }
    case 3: {
      const r = additionalInfoSchema.safeParse(s.additional);
      const errs = r.success ? {} : collect("additional", r.error);
      const fileError = validateFiles(s.files);
      return fileError ? { ...errs, attachments: fileError } : errs;
    }
    case 4:
      return s.consent ? {} : { consent: "Please confirm consent to process your information" };
    default:
      return {};
  }
}

export function RequestWizard({
  initialType = "quotation",
  initialService,
  initialSubcategory,
}: {
  initialType?: RequestType | undefined;
  initialService?: DivisionSlug | undefined;
  initialSubcategory?: string | undefined;
}) {
  const [state, setState] = useState(() => initialState(initialType, initialService, initialSubcategory));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<ConfirmationData | null>(null);
  const [phase, setPhase] = useState<"idle" | "submitting" | "uploading">("idle");
  const topRef = useRef<HTMLDivElement>(null);

  const submit = useServerFn(submitServiceRequest);
  const confirm = useServerFn(confirmRequestAttachments);

  const update: Parameters<typeof ClientDetailsStep>[0]["update"] = (section, patch) =>
    setState((s) => ({ ...s, [section]: { ...s[section], ...patch } }));

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const goTo = (target: number) => {
    setErrors({});
    setStep(target);
    scrollTop();
  };

  const next = () => {
    const errs = validateStep(step, state);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please review the highlighted fields.");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    scrollTop();
  };

  const mutation = useMutation({
    mutationFn: async (s: RequestFormState): Promise<ConfirmationData> => {
      setPhase("submitting");
      const attachments = s.files.map((f) => ({
        category: f.category,
        name: f.file.name,
        type: resolveMimeType(f.file.name, f.file.type) as never,
        size: f.file.size,
      }));
      const res = await submit({
        data: {
          requestType: s.requestType,
          client: s.client,
          service: { ...s.service, serviceCategory: s.service.serviceCategory as DivisionSlug },
          site: s.site,
          additional: s.additional,
          attachments,
          consent: true,
          website: s.website,
        },
      });

      let uploaded = 0;
      let failed = s.files.length - res.uploads.length;
      if (res.uploads.length > 0) {
        setPhase("uploading");
        const done: { path: string; category: string; name: string; type: string; size: number }[] = [];
        for (const u of res.uploads) {
          const sel = s.files[u.index];
          if (!sel) continue;
          const { error } = await supabase.storage.from(BUCKET).uploadToSignedUrl(u.path, u.token, sel.file, {
            contentType: attachments[u.index]!.type,
          });
          if (error) {
            failed += 1;
            continue;
          }
          done.push({ path: u.path, ...attachments[u.index]! });
        }
        if (done.length > 0) {
          try {
            const r = await confirm({ data: { token: res.trackingToken, files: done as never } });
            uploaded = r.recorded;
            failed += done.length - r.recorded;
          } catch {
            failed += done.length;
          }
        }
      }
      return { reference: res.reference, trackingToken: res.trackingToken, uploaded, failedUploads: failed, requestType: s.requestType, email: s.client.email };
    },
    onSuccess: (data) => {
      setResult(data);
      scrollTop();
    },
    onError: (e: Error) => toast.error(e.message || "Your request could not be submitted. Please try again."),
    onSettled: () => setPhase("idle"),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      next();
      return;
    }
    if (mutation.isPending) return;
    // Re-validate every step before sending.
    for (let i = 0; i < STEPS.length; i++) {
      const errs = validateStep(i, state);
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        if (i !== step) setStep(i);
        toast.error("Some details need attention before submitting.");
        scrollTop();
        return;
      }
    }
    mutation.mutate(state);
  };

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  if (result) {
    return (
      <div ref={topRef} className="scroll-mt-28">
        <RequestConfirmation data={result} />
      </div>
    );
  }

  const stepProps = { state, errors, update };

  return (
    <div ref={topRef} className="scroll-mt-28 grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="mb-4 h-1 overflow-hidden rounded-full bg-secondary lg:hidden">
          <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
        <ol className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1">
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li key={s.title} className="shrink-0">
                <button
                  type="button"
                  disabled={i > step}
                  onClick={() => goTo(i)}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-not-allowed",
                    active ? "bg-card font-semibold shadow-soft ring-1 ring-border" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[11px]",
                      done && "border-primary bg-primary text-primary-foreground",
                      active && "border-primary text-primary",
                    )}
                  >
                    {done ? <Check className="h-3 w-3" aria-hidden="true" /> : i + 1}
                  </span>
                  <span className="whitespace-nowrap">{s.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </aside>

      <form onSubmit={onSubmit} noValidate className="rounded-2xl border bg-card p-5 shadow-soft sm:p-8 md:p-10">
        {step === 0 && (
          <div className="mb-8">
            <p className="mb-3 text-sm font-medium">What would you like to request?</p>
            <ChoiceCards
              name="Request type"
              value={state.requestType}
              onChange={(v) => setState((s) => ({ ...s, requestType: v }))}
              options={[
                { value: "quotation", label: REQUEST_TYPE_LABELS.quotation, description: "An itemised proposal for supply and installation" },
                { value: "consultation", label: REQUEST_TYPE_LABELS.consultation, description: "Expert advice or an on-site survey first" },
              ]}
            />
          </div>
        )}

        <header className="mb-8 border-b pb-6">
          <p className="eyebrow text-cyan-deep">
            Step {step + 1} of {STEPS.length}
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{STEPS[step]!.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{STEPS[step]!.description}</p>
        </header>

        {step === 0 && <ClientDetailsStep {...stepProps} />}
        {step === 1 && <ServiceStep {...stepProps} />}
        {step === 2 && <SiteStep {...stepProps} />}
        {step === 3 && <AdditionalStep {...stepProps} setFiles={(files) => setState((s) => ({ ...s, files }))} />}
        {step === 4 && (
          <ReviewStep state={state} errors={errors} goTo={goTo} setConsent={(consent) => setState((s) => ({ ...s, consent }))} />
        )}

        <div className="hidden" aria-hidden="true">
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" value={state.website} onChange={(e) => setState((s) => ({ ...s, website: e.target.value }))} />
          </label>
        </div>

        <footer className="mt-10 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-between">
          <Button type="button" variant="ghost" onClick={() => goTo(step - 1)} disabled={step === 0 || mutation.isPending}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="submit" size="lg">
              Continue <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button type="submit" size="lg" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
              {phase === "uploading" ? "Uploading files…" : mutation.isPending ? "Submitting…" : "Submit request"}
            </Button>
          )}
        </footer>
      </form>
    </div>
  );
}
