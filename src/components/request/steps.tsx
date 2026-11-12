import { useRef } from "react";
import { FileText, ImageIcon, Paperclip, Pencil, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/site/FieldError";
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_CATEGORY_LABELS,
  CHANNEL_LABELS,
  FACILITY_TYPES,
  INSTALLATION_LABELS,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_BYTES,
  REQUEST_TYPE_LABELS,
  SITE_TYPES,
  type AttachmentCategory,
} from "@/lib/request-schema";
import { DIVISIONS, SUBCATEGORIES, isDivisionSlug } from "@/lib/site-content";
import { ChoiceCards, Field, SelectField } from "./fields";
import type { RequestFormState, SelectedFile, StepProps } from "./types";

const today = () => new Date().toISOString().slice(0, 10);

export function ClientDetailsStep({ state, errors, update }: StepProps) {
  const c = state.client;
  return (
    <div className="space-y-6">
      <Field id="clientType" label="Are you requesting as" required>
        <ChoiceCards
          name="Client type"
          value={c.clientType}
          onChange={(v) => update("client", { clientType: v })}
          options={[
            { value: "organization", label: "An organisation", description: "Company, institution, mission or agency" },
            { value: "individual", label: "An individual", description: "Private client or property owner" },
          ]}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        {c.clientType === "organization" && (
          <Field id="organizationName" label="Organisation name" required error={errors["client.organizationName"]} className="sm:col-span-2">
            <Input id="organizationName" autoComplete="organization" value={c.organizationName} onChange={(e) => update("client", { organizationName: e.target.value })} aria-invalid={!!errors["client.organizationName"]} />
          </Field>
        )}
        <Field id="contactName" label="Contact person" required error={errors["client.contactName"]}>
          <Input id="contactName" autoComplete="name" value={c.contactName} onChange={(e) => update("client", { contactName: e.target.value })} aria-invalid={!!errors["client.contactName"]} />
        </Field>
        <Field id="email" label="Email" required error={errors["client.email"]}>
          <Input id="email" type="email" autoComplete="email" value={c.email} onChange={(e) => update("client", { email: e.target.value })} aria-invalid={!!errors["client.email"]} />
        </Field>
        <Field id="phone" label="Telephone" required error={errors["client.phone"]} hint="Include the country code, e.g. +256">
          <Input id="phone" type="tel" autoComplete="tel" value={c.phone} onChange={(e) => update("client", { phone: e.target.value })} aria-invalid={!!errors["client.phone"]} />
        </Field>
        <Field id="country" label="Country" required error={errors["client.country"]}>
          <Input id="country" autoComplete="country-name" value={c.country} onChange={(e) => update("client", { country: e.target.value })} aria-invalid={!!errors["client.country"]} />
        </Field>
      </div>
      <Field id="preferredChannel" label="Preferred communication channel" required>
        <ChoiceCards
          name="Preferred communication channel"
          columns={3}
          value={c.preferredChannel}
          onChange={(v) => update("client", { preferredChannel: v })}
          options={(Object.keys(CHANNEL_LABELS) as (keyof typeof CHANNEL_LABELS)[]).map((k) => ({ value: k, label: CHANNEL_LABELS[k] }))}
        />
      </Field>
    </div>
  );
}

export function ServiceStep({ state, errors, update }: StepProps) {
  const s = state.service;
  const subs = isDivisionSlug(s.serviceCategory) ? SUBCATEGORIES[s.serviceCategory] : [];
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field id="serviceCategory" label="Main service category" required error={errors["service.serviceCategory"]}>
        <SelectField
          id="serviceCategory"
          value={s.serviceCategory}
          onChange={(v) => update("service", { serviceCategory: isDivisionSlug(v) ? v : "", subcategory: "" })}
          placeholder="Choose a division"
          invalid={!!errors["service.serviceCategory"]}
          options={DIVISIONS.map((d) => ({ value: d.slug, label: d.name }))}
        />
      </Field>
      <Field id="subcategory" label="Subcategory" required error={errors["service.subcategory"]}>
        <SelectField
          id="subcategory"
          value={s.subcategory}
          onChange={(v) => update("service", { subcategory: v })}
          placeholder={subs.length ? "Choose a subcategory" : "Choose a division first"}
          invalid={!!errors["service.subcategory"]}
          options={subs.map((x) => ({ value: x, label: x }))}
        />
      </Field>
      <Field id="projectTitle" label="Project title" required error={errors["service.projectTitle"]} className="sm:col-span-2" hint="A short name, e.g. “Head office CCTV upgrade”">
        <Input id="projectTitle" value={s.projectTitle} onChange={(e) => update("service", { projectTitle: e.target.value })} aria-invalid={!!errors["service.projectTitle"]} />
      </Field>
      <Field id="description" label="Description of requirements" required error={errors["service.description"]} className="sm:col-span-2">
        <Textarea id="description" rows={6} value={s.description} onChange={(e) => update("service", { description: e.target.value })} aria-invalid={!!errors["service.description"]} placeholder="What do you need, which areas should be covered, and are there any existing systems or constraints?" />
      </Field>
      <Field id="facilityType" label="Building or facility type" required error={errors["service.facilityType"]}>
        <SelectField
          id="facilityType"
          value={s.facilityType}
          onChange={(v) => update("service", { facilityType: v })}
          placeholder="Choose a facility type"
          invalid={!!errors["service.facilityType"]}
          options={FACILITY_TYPES.map((x) => ({ value: x, label: x }))}
        />
      </Field>
      <Field id="projectSize" label="Number of devices or approximate size" hint="Optional — e.g. 24 cameras, 3 floors, 1,200 m²" error={errors["service.projectSize"]}>
        <Input id="projectSize" value={s.projectSize} onChange={(e) => update("service", { projectSize: e.target.value })} />
      </Field>
    </div>
  );
}

export function SiteStep({ state, errors, update }: StepProps) {
  const s = state.site;
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field id="siteCountry" label="Project country" required error={errors["site.siteCountry"]}>
        <Input id="siteCountry" value={s.siteCountry} onChange={(e) => update("site", { siteCountry: e.target.value })} aria-invalid={!!errors["site.siteCountry"]} />
      </Field>
      <Field id="siteCity" label="City" required error={errors["site.siteCity"]}>
        <Input id="siteCity" value={s.siteCity} onChange={(e) => update("site", { siteCity: e.target.value })} aria-invalid={!!errors["site.siteCity"]} />
      </Field>
      <Field id="siteAddress" label="Site address" hint="Optional — shared only with the team handling your request" className="sm:col-span-2" error={errors["site.siteAddress"]}>
        <Input id="siteAddress" autoComplete="street-address" value={s.siteAddress} onChange={(e) => update("site", { siteAddress: e.target.value })} />
      </Field>
      <Field id="siteType" label="Site type" required error={errors["site.siteType"]}>
        <SelectField
          id="siteType"
          value={s.siteType}
          onChange={(v) => update("site", { siteType: v })}
          placeholder="Choose a site type"
          invalid={!!errors["site.siteType"]}
          options={SITE_TYPES.map((x) => ({ value: x, label: x }))}
        />
      </Field>
      <Field id="preferredVisitDate" label="Preferred site visit date" hint="Optional" error={errors["site.preferredVisitDate"]}>
        <Input id="preferredVisitDate" type="date" min={today()} value={s.preferredVisitDate} onChange={(e) => update("site", { preferredVisitDate: e.target.value })} />
      </Field>
      <Field id="installationType" label="New installation or upgrade" required className="sm:col-span-2">
        <ChoiceCards
          name="Installation type"
          columns={3}
          value={s.installationType}
          onChange={(v) => update("site", { installationType: v })}
          options={(Object.keys(INSTALLATION_LABELS) as (keyof typeof INSTALLATION_LABELS)[]).map((k) => ({ value: k, label: INSTALLATION_LABELS[k] }))}
        />
      </Field>
    </div>
  );
}

function formatBytes(n: number) {
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdditionalStep({
  state,
  errors,
  update,
  setFiles,
}: StepProps & { setFiles: (files: SelectedFile[]) => void }) {
  const a = state.additional;
  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="estimatedBudget" label="Estimated budget" hint="Optional — include the currency" error={errors["additional.estimatedBudget"]}>
          <Input id="estimatedBudget" value={a.estimatedBudget} onChange={(e) => update("additional", { estimatedBudget: e.target.value })} />
        </Field>
        <Field id="desiredCompletionDate" label="Desired completion date" hint="Optional" error={errors["additional.desiredCompletionDate"]}>
          <Input id="desiredCompletionDate" type="date" min={today()} value={a.desiredCompletionDate} onChange={(e) => update("additional", { desiredCompletionDate: e.target.value })} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FileDrop category="site_photo" icon={<ImageIcon className="h-5 w-5" />} label="Site photographs" accept=".jpg,.jpeg,.png,.webp,.heic" state={state} setFiles={setFiles} />
        <FileDrop category="technical_document" icon={<FileText className="h-5 w-5" />} label="Technical documents" accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.dxf" state={state} setFiles={setFiles} />
        <FileDrop category="attachment" icon={<Paperclip className="h-5 w-5" />} label="Other attachments" accept={ATTACHMENT_ACCEPT} state={state} setFiles={setFiles} />
      </div>
      <FieldError message={errors.attachments} />

      {state.files.length > 0 && (
        <ul className="divide-y rounded-lg border">
          {state.files.map((f) => (
            <li key={f.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{f.file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {ATTACHMENT_CATEGORY_LABELS[f.category]} · {formatBytes(f.file.size)}
                </span>
              </span>
              <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${f.file.name}`} onClick={() => setFiles(state.files.filter((x) => x.id !== f.id))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">
        Up to {MAX_ATTACHMENTS} files, {formatBytes(MAX_ATTACHMENT_BYTES)} each. Files are stored privately and are only visible to the team handling your request.
      </p>

      <Field id="additionalComments" label="Additional comments" hint="Optional" error={errors["additional.additionalComments"]}>
        <Textarea id="additionalComments" rows={4} value={a.additionalComments} onChange={(e) => update("additional", { additionalComments: e.target.value })} />
      </Field>
    </div>
  );
}

function FileDrop({
  category,
  icon,
  label,
  accept,
  state,
  setFiles,
}: {
  category: AttachmentCategory;
  icon: React.ReactNode;
  label: string;
  accept: string;
  state: RequestFormState;
  setFiles: (files: SelectedFile[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const count = state.files.filter((f) => f.category === category).length;
  const add = (list: FileList | null) => {
    if (!list) return;
    const next = [...state.files];
    for (const file of Array.from(list)) {
      next.push({ id: crypto.randomUUID(), file, category });
    }
    setFiles(next);
    if (inputRef.current) inputRef.current.value = "";
  };
  return (
    <label
      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-secondary/40 px-4 py-6 text-center transition-colors hover:border-primary hover:bg-accent/40 focus-within:ring-2 focus-within:ring-ring"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        add(e.dataTransfer.files);
      }}
    >
      <span className="text-cyan-deep">{icon}</span>
      <span className="text-sm font-semibold">{label}</span>
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Upload className="h-3 w-3" aria-hidden="true" />
        {count > 0 ? `${count} selected · add more` : "Click or drop files"}
      </span>
      <input ref={inputRef} type="file" multiple accept={accept} className="sr-only" onChange={(e) => add(e.target.files)} />
    </label>
  );
}

function ReviewSection({ title, onEdit, rows }: { title: string; onEdit: () => void; rows: [string, string | undefined][] }) {
  return (
    <section className="rounded-lg border">
      <header className="flex items-center justify-between border-b bg-secondary/50 px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
        </Button>
      </header>
      <dl className="divide-y">
        {rows
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="grid gap-1 px-4 py-2.5 text-sm sm:grid-cols-[180px_1fr]">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="whitespace-pre-line break-words">{v}</dd>
            </div>
          ))}
      </dl>
    </section>
  );
}

export function ReviewStep({
  state,
  errors,
  goTo,
  setConsent,
}: {
  state: RequestFormState;
  errors: Record<string, string>;
  goTo: (step: number) => void;
  setConsent: (v: boolean) => void;
}) {
  const division = DIVISIONS.find((d) => d.slug === state.service.serviceCategory);
  return (
    <div className="space-y-5">
      <ReviewSection
        title="Client details"
        onEdit={() => goTo(0)}
        rows={[
          ["Request type", REQUEST_TYPE_LABELS[state.requestType]],
          ["Requesting as", state.client.clientType === "organization" ? "Organisation" : "Individual"],
          ["Organisation", state.client.clientType === "organization" ? state.client.organizationName : undefined],
          ["Contact person", state.client.contactName],
          ["Email", state.client.email],
          ["Telephone", state.client.phone],
          ["Country", state.client.country],
          ["Preferred channel", CHANNEL_LABELS[state.client.preferredChannel]],
        ]}
      />
      <ReviewSection
        title="Service requirements"
        onEdit={() => goTo(1)}
        rows={[
          ["Service", division?.name],
          ["Subcategory", state.service.subcategory],
          ["Project title", state.service.projectTitle],
          ["Requirements", state.service.description],
          ["Facility type", state.service.facilityType],
          ["Size / devices", state.service.projectSize],
        ]}
      />
      <ReviewSection
        title="Site information"
        onEdit={() => goTo(2)}
        rows={[
          ["Location", [state.site.siteCity, state.site.siteCountry].filter(Boolean).join(", ")],
          ["Address", state.site.siteAddress],
          ["Site type", state.site.siteType],
          ["Installation", INSTALLATION_LABELS[state.site.installationType]],
          ["Preferred visit", state.site.preferredVisitDate],
        ]}
      />
      <ReviewSection
        title="Additional information"
        onEdit={() => goTo(3)}
        rows={[
          ["Estimated budget", state.additional.estimatedBudget],
          ["Desired completion", state.additional.desiredCompletionDate],
          ["Files", state.files.length ? state.files.map((f) => f.file.name).join("\n") : "None"],
          ["Comments", state.additional.additionalComments],
        ]}
      />
      <div className="rounded-lg border bg-accent/30 p-4">
        <label className="flex items-start gap-3 text-sm">
          <Checkbox checked={state.consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" aria-invalid={!!errors.consent} />
          <span>
            I consent to RAPID SYSTEMS processing the information and files in this request to assess my requirements,
            contact me about it and prepare a proposal.
          </span>
        </label>
        <FieldError message={errors.consent} />
      </div>
    </div>
  );
}
