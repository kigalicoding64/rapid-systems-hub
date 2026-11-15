import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FieldError } from "@/components/site/FieldError";
import { AuthLayout, GOOGLE_SANS_LINK } from "@/components/auth/AuthLayout";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { supabase } from "@/integrations/supabase/client";
import { authErrorMessage, fetchMyAccount, myAccountQueryOptions } from "@/lib/account";
import { MIN_PASSWORD_LENGTH, homeFor, registerSchema, safeRedirect } from "@/lib/auth-utils";

interface AuthSearch {
  redirect?: string | undefined;
  mode?: "signin" | "signup" | undefined;
}

const REDIRECT_KEY = "rs-auth-redirect";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    redirect: safeRedirect(search["redirect"]),
    mode: search["mode"] === "signup" ? "signup" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in or create an account | RAPID SYSTEMS" },
      { name: "description", content: "Sign in to the RAPID SYSTEMS client portal or team workspace, or register as a client to follow your requests." },
      { property: "og:title", content: "Sign in | RAPID SYSTEMS" },
      { property: "og:description", content: "Secure access for RAPID SYSTEMS clients and team members." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
    links: [GOOGLE_SANS_LINK],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: account } = useQuery(myAccountQueryOptions());
  const [tab, setTab] = useState<"signin" | "signup">(search.mode ?? "signin");

  // Already signed in (including returning from Google): go to the requested page or the right home.
  useEffect(() => {
    if (!account) return;
    let target = search.redirect;
    if (!target) {
      target = safeRedirect(sessionStorage.getItem(REDIRECT_KEY)) ?? undefined;
    }
    sessionStorage.removeItem(REDIRECT_KEY);
    void navigate({ to: target ?? homeFor(account.roles), replace: true });
  }, [account, navigate, search.redirect]);

  async function afterSignIn() {
    const acc = await fetchMyAccount();
    queryClient.setQueryData(["my-account"], acc);
  }

  function rememberRedirect() {
    if (search.redirect) sessionStorage.setItem(REDIRECT_KEY, search.redirect);
  }

  return (
    <AuthLayout
      title={tab === "signin" ? "Welcome back" : "Create your client account"}
      description={
        tab === "signin"
          ? "Sign in to follow your requests or open the team workspace."
          : "Register to submit requests, follow progress and keep your documents in one place."
      }
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign in</TabsTrigger>
          <TabsTrigger value="signup">Create account</TabsTrigger>
        </TabsList>
        <TabsContent value="signin" className="mt-6">
          <div onClickCapture={rememberRedirect}>
            <GoogleButton label="Sign in with Google" onSignedIn={afterSignIn} />
          </div>
          <Divider />
          <SignInForm onSignedIn={afterSignIn} />
        </TabsContent>
        <TabsContent value="signup" className="mt-6">
          <div onClickCapture={rememberRedirect}>
            <GoogleButton label="Sign up with Google" onSignedIn={afterSignIn} />
          </div>
          <Divider />
          <SignUpForm />
        </TabsContent>
      </Tabs>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Just need a quote?{" "}
        <Link to="/request-quote" className="font-medium text-primary hover:underline">
          Submit a request without an account
        </Link>
      </p>
    </AuthLayout>
  );
}

function Divider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      or with email
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function SignInForm({ onSignedIn }: { onSignedIn: () => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    setError(undefined);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (err) {
      setError(authErrorMessage(err));
      setBusy(false);
      return;
    }
    await onSignedIn();
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <Label htmlFor="si-email">Email</Label>
        <Input id="si-email" type="email" autoComplete="email" className="mt-2" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="si-password">Password</Label>
          <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input id="si-password" type="password" autoComplete="current-password" className="mt-2" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" size="lg" disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {busy ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

const EMPTY_SIGNUP = { fullName: "", organizationName: "", phone: "", email: "", password: "", confirmPassword: "" };

function SignUpForm() {
  const [values, setValues] = useState(EMPTY_SIGNUP);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [sentTo, setSentTo] = useState<string>();
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof EMPTY_SIGNUP) => (e: React.ChangeEvent<HTMLInputElement>) => setValues((s) => ({ ...s, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] ??= issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setFormError(undefined);
    setBusy(true);
    const v = parsed.data;
    const { error } = await supabase.auth.signUp({
      email: v.email,
      password: v.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
        data: { full_name: v.fullName, organization_name: v.organizationName ?? "", phone: v.phone ?? "" },
      },
    });
    setBusy(false);
    if (error) {
      setFormError(authErrorMessage(error));
      return;
    }
    setSentTo(v.email);
    setValues(EMPTY_SIGNUP);
  }

  if (sentTo) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center shadow-soft" role="status">
        <MailCheck className="mx-auto h-10 w-10 text-success" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold">Check your email</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a confirmation link to <span className="font-medium text-foreground">{sentTo}</span>. Open it to activate your account, then sign in.
        </p>
        <p className="mt-4 flex items-start gap-2 rounded-md bg-secondary p-3 text-left text-xs text-muted-foreground">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
          Requests you submitted earlier with this email are added to your account automatically once it is confirmed.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <Label htmlFor="su-name">Full name *</Label>
        <Input id="su-name" autoComplete="name" className="mt-2" value={values.fullName} onChange={set("fullName")} aria-invalid={!!errors["fullName"]} />
        <FieldError message={errors["fullName"]} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="su-org">Organisation</Label>
          <Input id="su-org" autoComplete="organization" className="mt-2" value={values.organizationName} onChange={set("organizationName")} />
          <FieldError message={errors["organizationName"]} />
        </div>
        <div>
          <Label htmlFor="su-phone">Telephone</Label>
          <Input id="su-phone" type="tel" autoComplete="tel" className="mt-2" value={values.phone} onChange={set("phone")} aria-invalid={!!errors["phone"]} />
          <FieldError message={errors["phone"]} />
        </div>
      </div>
      <div>
        <Label htmlFor="su-email">Email *</Label>
        <Input id="su-email" type="email" autoComplete="email" className="mt-2" value={values.email} onChange={set("email")} aria-invalid={!!errors["email"]} />
        <FieldError message={errors["email"]} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="su-pass">Password *</Label>
          <Input id="su-pass" type="password" autoComplete="new-password" className="mt-2" value={values.password} onChange={set("password")} aria-invalid={!!errors["password"]} />
          <FieldError message={errors["password"]} />
        </div>
        <div>
          <Label htmlFor="su-confirm">Confirm password *</Label>
          <Input id="su-confirm" type="password" autoComplete="new-password" className="mt-2" value={values.confirmPassword} onChange={set("confirmPassword")} aria-invalid={!!errors["confirmPassword"]} />
          <FieldError message={errors["confirmPassword"]} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">At least {MIN_PASSWORD_LENGTH} characters, with a letter and a number.</p>
      {formError && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}
      <Button type="submit" className="w-full" size="lg" disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {busy ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
