// Shared account rules: role names, who counts as staff/admin, sign-up validation and
// safe post-sign-in redirects. Database functions (is_staff, is_admin, has_role) are the
// real security checks; these helpers only drive navigation and form feedback.
import { z } from "zod";

export const APP_ROLES = [
  "super_admin",
  "director",
  "operations_manager",
  "sales",
  "project_manager",
  "engineer",
  "technician",
  "finance_officer",
  "client",
] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const STAFF_ROLES = APP_ROLES.filter((r) => r !== "client") as Exclude<AppRole, "client">[];
export type StaffRole = (typeof STAFF_ROLES)[number];
export const ADMIN_ROLES: readonly AppRole[] = ["super_admin", "director"];

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Administrator",
  director: "Director",
  operations_manager: "Operations Manager",
  sales: "Sales / Business Development",
  project_manager: "Project Manager",
  engineer: "Engineer",
  technician: "Technician",
  finance_officer: "Finance Officer",
  client: "Client",
};

export const isStaffRoles = (roles: readonly AppRole[]) => roles.some((r) => r !== "client");
export const isAdminRoles = (roles: readonly AppRole[]) => roles.some((r) => ADMIN_ROLES.includes(r));

/** Highest-ranked role, used for the role badge. */
export function primaryRole(roles: readonly AppRole[]): AppRole {
  for (const r of APP_ROLES) if (roles.includes(r)) return r;
  return "client";
}

/** Where a signed-in person lands when no specific page was requested. */
export function homeFor(roles: readonly AppRole[]): "/app/dashboard" | "/client/dashboard" {
  return isStaffRoles(roles) ? "/app/dashboard" : "/client/dashboard";
}

const AUTH_PAGES = ["/client/login", "/client/register", "/auth", "/forgot-password", "/reset-password"];

/** Accepts only same-site paths, so a crafted link cannot send people to another website after sign-in. */
export function safeRedirect(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return undefined;
  if (/[\u0000-\u001f]/.test(value)) return undefined;
  const path = value.split(/[?#]/)[0]!;
  if (AUTH_PAGES.includes(path)) return undefined;
  return value;
}

export const MIN_PASSWORD_LENGTH = 8;
export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, { message: `Use at least ${MIN_PASSWORD_LENGTH} characters` })
  .max(72, { message: "Use 72 characters or fewer" })
  .regex(/[A-Za-z]/, { message: "Include at least one letter" })
  .regex(/\d/, { message: "Include at least one number" });

const phoneSchema = z
  .string()
  .trim()
  .max(32)
  .regex(/^[+()\d\s-]*$/, { message: "Use digits, spaces, +, - or brackets only" })
  .optional()
  .transform((v) => (v ? v : undefined));

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, { message: "Enter your full name" }).max(120),
    organizationName: z
      .string()
      .trim()
      .max(160)
      .optional()
      .transform((v) => (v ? v : undefined)),
    phone: phoneSchema,
    email: z.string().trim().toLowerCase().email({ message: "Enter a valid email address" }).max(255),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, { message: "Enter your full name" }).max(120),
  phone: phoneSchema,
  jobTitle: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export const organizationSchema = z.object({
  name: z.string().trim().min(2, { message: "Enter the organisation name" }).max(160),
  country: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((v) => (v ? v : undefined)),
});

const optionalShort = z
  .string()
  .trim()
  .max(120)
  .optional()
  .transform((v) => (v ? v : undefined));

export const inviteStaffSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: "Enter a valid email address" }).max(255),
  fullName: z.string().trim().min(2, { message: "Enter the staff member's name" }).max(120),
  role: z.enum(STAFF_ROLES as [StaffRole, ...StaffRole[]]),
  department: optionalShort,
  jobTitle: optionalShort,
});

export const updateStaffSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(STAFF_ROLES as [StaffRole, ...StaffRole[]]),
  isActive: z.boolean(),
  department: optionalShort,
  jobTitle: optionalShort,
  skills: z.array(z.string().trim().min(1).max(60)).max(30).default([]),
});

/** Rules for changing a staff member's role or active status; the server applies the same function. */
export function staffChangeError(input: {
  actorId: string;
  actorRoles: readonly AppRole[];
  targetId: string;
  targetRoles: readonly AppRole[];
  nextRole: StaffRole;
  nextActive: boolean;
  activeSuperAdmins: number;
}): string | undefined {
  const { actorId, actorRoles, targetId, targetRoles, nextRole, nextActive, activeSuperAdmins } = input;
  if (!isAdminRoles(actorRoles)) return "Only directors and super administrators can manage staff.";
  const actorIsSuper = actorRoles.includes("super_admin");
  const targetIsSuper = targetRoles.includes("super_admin");
  if ((nextRole === "super_admin" || targetIsSuper) && !actorIsSuper) {
    return "Only a super administrator can grant or change super administrator access.";
  }
  if (actorId === targetId) {
    const currentRole = primaryRole(targetRoles);
    if (nextRole !== currentRole || !nextActive) return "You cannot change your own role or deactivate yourself.";
  }
  if (targetIsSuper && (nextRole !== "super_admin" || !nextActive) && activeSuperAdmins <= 1) {
    return "At least one active super administrator must remain.";
  }
  return undefined;
}
