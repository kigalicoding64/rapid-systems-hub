import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { supabase } from "@/integrations/supabase/client";
import { authErrorMessage, fetchMyAccount, myAccountQueryOptions } from "@/lib/account";
import { homeFor, safeRedirect } from "@/lib/auth-utils";

interface AuthSearch {
  redirect?: string | undefined;
}

const REDIRECT_KEY = "rs-auth-redirect";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    redirect: safeRedirect(search["redirect"]),
  }),
  head: () => ({
    meta: [
      { title: "Sign in | RAPID SYSTEMS" },
      { name: "description", content: "Sign in to the RAPID SYSTEMS client portal or team workspace." },
      { property: "og:title", content: "Sign in | RAPID SYSTEMS" },
      { property: "og:description", content: "Secure access for RAPID SYSTEMS clients and team members." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: account } = useQuery(myAccountQueryOptions());

  // Already signed in: go to the requested page or the right home.
  useEffect(() => {
    if (!account) return;
    const target = search.redirect ?? safeRedirect(sessionStorage.getItem(REDIRECT_KEY)) ?? undefined;
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
      title="Welcome back"
      description="Sign in to follow your requests or open the team workspace."
    >
      <div onClickCapture={rememberRedirect}>
        <SignInForm onSignedIn={afterSignIn} />
      </div>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Just need a quote?{" "}
        <Link to="/request-quote" className="font-medium text-primary hover:underline">
          Submit a request without an account
        </Link>
      </p>
    </AuthLayout>
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
