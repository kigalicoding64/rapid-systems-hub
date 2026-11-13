import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  inviteStaffSchema,
  organizationSchema,
  primaryRole,
  staffChangeError,
  updateStaffSchema,
  type AppRole,
} from "./auth-utils";

type AuthedSupabase = { rpc: (fn: "is_admin", args: { _user_id: string }) => PromiseLike<{ data: boolean | null }> };

async function rolesOf(client: { from: (t: "user_roles") => any }, userId: string): Promise<AppRole[]> {
  const { data } = await client.from("user_roles").select("role").eq("user_id", userId);
  return ((data ?? []) as { role: AppRole }[]).map((r) => r.role);
}

/** Directors and super administrators add staff. New addresses receive a sign-up invitation email. */
export const inviteStaffMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inviteStaffSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await (context.supabase as unknown as AuthedSupabase).rpc("is_admin", {
      _user_id: context.userId,
    });
    if (!isAdmin) throw new Error("Only directors and super administrators can add staff.");
    const actorRoles = await rolesOf(context.supabase, context.userId);
    if (data.role === "super_admin" && !actorRoles.includes("super_admin")) {
      throw new Error("Only a super administrator can grant super administrator access.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id, account_type")
      .eq("email", data.email)
      .maybeSingle();

    let userId: string;
    let invited = false;
    if (existing) {
      if (existing.account_type === "staff") throw new Error("This person is already on the team. Edit them in the list instead.");
      userId = existing.id;
    } else {
      const origin = getRequestHeader("origin") ?? "";
      const { data: created, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
        data: { full_name: data.fullName },
        ...(origin.startsWith("http") ? { redirectTo: `${origin}/reset-password` } : {}),
      });
      if (error || !created.user) {
        console.error("inviteUserByEmail failed", error);
        throw new Error("The invitation could not be sent. Check the address and try again.");
      }
      userId = created.user.id;
      invited = true;
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        account_type: "staff",
        is_active: true,
        full_name: data.fullName,
        department: data.department ?? null,
        job_title: data.jobTitle ?? null,
      })
      .eq("id", userId);
    if (profileError) throw new Error("Could not save the staff profile.");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: data.role });
    if (roleError) throw new Error("Could not assign the role.");

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: context.userId,
      action: invited ? "staff.invited" : "staff.converted_from_client",
      entity_type: "user",
      entity_id: userId,
      details: { email: data.email, role: data.role },
    });
    return { invited };
  });

/** Changes role, active status and team details; the same rules as the browser apply here. */
export const updateStaffMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateStaffSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [actorRoles, targetRoles, { data: target }, { data: supers }] = await Promise.all([
      rolesOf(context.supabase, context.userId),
      rolesOf(supabaseAdmin, data.userId),
      supabaseAdmin.from("profiles").select("id, account_type, is_active").eq("id", data.userId).maybeSingle(),
      supabaseAdmin.from("user_roles").select("user_id, profiles!inner(is_active)").eq("role", "super_admin"),
    ]);
    if (!target || target.account_type !== "staff") throw new Error("Staff member not found.");
    const activeSuperAdmins = ((supers ?? []) as unknown as { profiles: { is_active: boolean } }[]).filter(
      (s) => s.profiles?.is_active,
    ).length;
    // actorRoles come through the caller's own RLS-scoped client; re-check admin status in the database.
    const { data: isAdmin } = await (context.supabase as unknown as AuthedSupabase).rpc("is_admin", {
      _user_id: context.userId,
    });
    const problem = staffChangeError({
      actorId: context.userId,
      actorRoles: isAdmin ? actorRoles : [],
      targetId: data.userId,
      targetRoles,
      nextRole: data.role,
      nextActive: data.isActive,
      activeSuperAdmins,
    });
    if (problem) throw new Error(problem);

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        is_active: data.isActive,
        department: data.department ?? null,
        job_title: data.jobTitle ?? null,
        skills: data.skills,
      })
      .eq("id", data.userId);
    if (error) throw new Error("Could not save changes.");

    const previousRole = primaryRole(targetRoles);
    if (previousRole !== data.role) {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
      const { error: roleError } = await supabaseAdmin.from("user_roles").insert({ user_id: data.userId, role: data.role });
      if (roleError) throw new Error("Could not change the role.");
      await supabaseAdmin.from("audit_logs").insert({
        actor_id: context.userId,
        action: "staff.role_changed",
        entity_type: "user",
        entity_id: data.userId,
        details: { from: previousRole, to: data.role },
      });
    }
    if (target.is_active !== data.isActive) {
      await supabaseAdmin.from("audit_logs").insert({
        actor_id: context.userId,
        action: data.isActive ? "staff.reactivated" : "staff.deactivated",
        entity_type: "user",
        entity_id: data.userId,
        details: {},
      });
    }
    return { ok: true as const };
  });

/** A client creates or renames their organisation. Linking is done here so nobody can join another organisation. */
export const saveMyOrganization = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => organizationSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", context.userId)
      .maybeSingle();
    if (!profile) throw new Error("Profile not found.");
    if (profile.organization_id) {
      const { error } = await context.supabase
        .from("organizations")
        .update({ name: data.name, country: data.country ?? null })
        .eq("id", profile.organization_id);
      if (error) throw new Error("Could not update the organisation.");
      return { ok: true as const };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: org, error } = await supabaseAdmin
      .from("organizations")
      .insert({ name: data.name, country: data.country ?? null, created_by: context.userId })
      .select("id")
      .single();
    if (error || !org) throw new Error("Could not create the organisation.");
    await supabaseAdmin.from("profiles").update({ organization_id: org.id }).eq("id", context.userId);
    return { ok: true as const };
  });
