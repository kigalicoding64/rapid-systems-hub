import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, CheckCircle2, Loader2, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { friendlyError } from "@/lib/user-error";
import { FieldError } from "@/components/site/FieldError";
import { companyQueryOptions } from "@/lib/company.functions";
import { leadershipQueryOptions } from "@/lib/leadership.functions";
import { submitContactEnquiry } from "@/lib/contact.functions";
import { contactEnquirySchema, type ContactEnquiryInput } from "@/lib/request-schema";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact RAPID SYSTEMS" },
      {
        name: "description",
        content: "Contact RAPID SYSTEMS by email or telephone, or send a message about your security, fire safety, AV or infrastructure project.",
      },
      { property: "og:title", content: "Contact RAPID SYSTEMS" },
      { property: "og:description", content: "Speak with our team about your next integrated technology project." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(leadershipQueryOptions()),
  component: ContactPage,
});

const EMPTY: ContactEnquiryInput = { name: "", email: "", phone: "", organization: "", subject: "", message: "", website: "" };

function ContactPage() {
  const { data: company } = useSuspenseQuery(companyQueryOptions());
  const { data: leaders } = useSuspenseQuery(leadershipQueryOptions());
  const executive = leaders.find((l) => l.email);
  const [values, setValues] = useState<ContactEnquiryInput>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const send = useServerFn(submitContactEnquiry);
  const mutation = useMutation({
    mutationFn: (data: ContactEnquiryInput) => send({ data }),
    onSuccess: () => {
      setSent(true);
      setValues(EMPTY);
    },
    onError: (e: Error) => toast.error(friendlyError(e, "We could not send your message right now. Please try again shortly or email rapidsystemsug@gmail.com.")),
  });

  const set = (key: keyof ContactEnquiryInput) => (v: string) => setValues((s) => ({ ...s, [key]: v }));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (mutation.isPending) return;
    const parsed = contactEnquirySchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] ??= issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    mutation.mutate(values);
  }

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Contact"
        title="Speak with our team."
        description="For project enquiries, quotations or site assessments, reach us directly or send a message below."
        crumbs={[{ label: "Contact" }]}
      />
      <section className="container-site grid gap-10 py-16 md:py-24 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <a href={`mailto:${company.email}`} className="flex items-start gap-4 rounded-xl border bg-card p-6 shadow-soft hover:border-primary">
            <Mail className="h-5 w-5 text-cyan-deep" aria-hidden="true" />
            <span>
              <span className="eyebrow block text-muted-foreground">General enquiries</span>
              <span className="mt-1 block font-medium">{company.email}</span>
            </span>
          </a>
          <div className="flex items-start gap-4 rounded-xl border bg-card p-6 shadow-soft">
            <Phone className="h-5 w-5 text-cyan-deep" aria-hidden="true" />
            <span>
              <span className="eyebrow block text-muted-foreground">Telephone</span>
              {company.phones.map((p, i) => (
                <a key={p} href={`tel:${p.replace(/\s+/g, "")}`} className="mt-1 block font-medium hover:text-primary">
                  {p}
                  {company.phones.length > 1 && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">{i === 0 ? "Main line" : "Secondary"}</span>
                  )}
                </a>
              ))}
            </span>
          </div>
          {executive && (
            <a href={`mailto:${executive.email}`} className="flex items-start gap-4 rounded-xl border bg-card p-6 shadow-soft hover:border-primary">
              <UserRound className="h-5 w-5 text-cyan-deep" aria-hidden="true" />
              <span>
                <span className="eyebrow block text-muted-foreground">Executive office</span>
                <span className="mt-1 block font-medium">{executive.fullName}, {executive.title}</span>
                <span className="mt-0.5 block break-all text-sm text-muted-foreground">{executive.email}</span>
              </span>
            </a>
          )}
          <div className="flex items-start gap-4 rounded-xl border bg-card p-6 shadow-soft">
            <MapPin className="h-5 w-5 text-cyan-deep" aria-hidden="true" />
            <span>
              <span className="eyebrow block text-muted-foreground">Region</span>
              <span className="mt-1 block font-medium">{company.region}</span>
            </span>
          </div>
          <div className="rounded-xl border border-dashed p-6">
            <p className="font-semibold">Need a formal quotation?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Use the request form to share technical and site details. You will receive a reference number and a secure tracking link.
            </p>
            <Link to="/request-quote" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              Start a request <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-soft md:p-10">
          {sent ? (
            <div className="py-10 text-center" role="status">
              <CheckCircle2 className="mx-auto h-10 w-10 text-success" aria-hidden="true" />
              <h2 className="mt-4 text-2xl font-semibold">Message received</h2>
              <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                Thank you for contacting {company.companyName}. Our team will review your message and respond using the details you provided.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              <h2 className="text-2xl font-semibold">Send a message</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="c-name">Full name *</Label>
                  <Input id="c-name" className="mt-2" autoComplete="name" value={values.name} onChange={(e) => set("name")(e.target.value)} aria-invalid={!!errors["name"]} />
                  <FieldError message={errors["name"]} />
                </div>
                <div>
                  <Label htmlFor="c-email">Email *</Label>
                  <Input id="c-email" type="email" className="mt-2" autoComplete="email" value={values.email} onChange={(e) => set("email")(e.target.value)} aria-invalid={!!errors["email"]} />
                  <FieldError message={errors["email"]} />
                </div>
                <div>
                  <Label htmlFor="c-phone">Telephone</Label>
                  <Input id="c-phone" type="tel" className="mt-2" autoComplete="tel" value={values.phone} onChange={(e) => set("phone")(e.target.value)} />
                  <FieldError message={errors["phone"]} />
                </div>
                <div>
                  <Label htmlFor="c-org">Organisation</Label>
                  <Input id="c-org" className="mt-2" autoComplete="organization" value={values.organization} onChange={(e) => set("organization")(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="c-subject">Subject *</Label>
                <Input id="c-subject" className="mt-2" value={values.subject} onChange={(e) => set("subject")(e.target.value)} aria-invalid={!!errors["subject"]} />
                <FieldError message={errors["subject"]} />
              </div>
              <div>
                <Label htmlFor="c-message">Message *</Label>
                <Textarea id="c-message" rows={6} className="mt-2" value={values.message} onChange={(e) => set("message")(e.target.value)} aria-invalid={!!errors["message"]} />
                <FieldError message={errors["message"]} />
              </div>
              <div className="hidden" aria-hidden="true">
                <label>
                  Website
                  <input tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set("website")(e.target.value)} />
                </label>
              </div>
              <Button type="submit" size="lg" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {mutation.isPending ? "Sending…" : "Send message"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
