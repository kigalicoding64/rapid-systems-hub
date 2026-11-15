// Signed-in account data read through the browser client (RLS: people see their own profile and roles).
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isAdminRoles, isStaffRoles, type AppRole } from "./auth-utils";

export interface MyAccount {
  userId: string;
  email: string;
  fullName: string;
  phone: string | null;
  jobTitle: string | null;
  department: string | null;
  accountType: "client" | "staff";
  isActive: boolean;
  roles: AppRole[];
  isStaff: boolean;
  isAdmin: boolean;
  organization: { id: string; name: string; country: string | null } | null;
}

export async function fetchMyAccount(): Promise<MyAccount | null> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;
  const [{ data: profile }, { data: roleRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("email, full_name, phone, job_title, department, account_type, is_active, organization_id, organizations(id, name, country)")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
  ]);
  const roles = (roleRows ?? []).map((r) => r.role as AppRole);
  const activeRoles = profile?.is_active === false ? roles.filter((r) => r === "client") : roles;
  const org = profile?.organizations as { id: string; name: string; country: string | null } | null | undefined;
  return {
    userId: user.id,
    email: profile?.email || user.email || "",
    fullName: profile?.full_name ?? "",
    phone: profile?.phone ?? null,
    jobTitle: profile?.job_title ?? null,
    department: profile?.department ?? null,
    accountType: (profile?.account_type as "client" | "staff" | undefined) ?? "client",
    isActive: profile?.is_active ?? true,
    roles: activeRoles.length ? activeRoles : ["client"],
    isStaff: isStaffRoles(activeRoles),
    isAdmin: isAdminRoles(activeRoles),
    organization: org ?? null,
  };
}

export const myAccountQueryOptions = () =>
  queryOptions({ queryKey: ["my-account"], queryFn: fetchMyAccount, staleTime: 60_000 });

/** Turns sign-in service errors into plain sentences for visitors. */
export function authErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error ?? "");
  const code = (error as { code?: string } | null)?.code ?? "";
  if (/invalid login credentials/i.test(msg) || code === "invalid_credentials") return "Incorrect email or password.";
  if (/email not confirmed/i.test(msg) || code === "email_not_confirmed")
    return "Please confirm your email address first — check your inbox for the confirmation link.";
  if (/already registered|already exists/i.test(msg) || code === "user_already_exists")
    return "An account with this email already exists. Sign in instead, or reset your password.";
  if (/rate limit|too many/i.test(msg)) return "Too many attempts. Please wait a few minutes and try again.";
  if (/weak|pwned|leaked/i.test(msg) || code === "weak_password")
    return "This password is too easy to guess or has appeared in a data breach. Choose a different one.";
  if (/same.*password|different from the old/i.test(msg)) return "Choose a password different from your current one.";
  if (/current password/i.test(msg)) return "Your current password is incorrect.";
  return "Something went wrong. Please try again in a moment.";
}
