import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { supabase } from "@/integrations/supabase/client";
import { authErrorMessage } from "@/lib/account";
import { passwordSchema } from "@/lib/auth-utils";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password | RAPID SYSTEMS" },
      { name: "description", content: "Set a new password for your RAPID SYSTEMS account." },
      { property: "og:title", content: "Choose a new password | RAPID SYSTEMS" },
      { property: "og:description", content: "Set a new password for your RAPID SYSTEMS account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) return setError(parsed.error.issues[0]?.message);
    if (password !== confirm) return setError("Passwords do not match");
    setBusy(true);
    setError(undefined);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) return setError(authErrorMessage(err));
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <AuthLayout title="Choose a new password" description="Open this page from the link in your reset email.">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <Label htmlFor="rp-pass">New password</Label>
          <Input id="rp-pass" type="password" autoComplete="new-password" className="mt-2" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="rp-confirm">Confirm new password</Label>
          <Input id="rp-confirm" type="password" autoComplete="new-password" className="mt-2" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" size="lg" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Save new password
        </Button>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link to="/auth" className="font-medium text-primary hover:underline">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
