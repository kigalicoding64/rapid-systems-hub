// Shared validation for the public service request form. Used by the browser for
// step-by-step feedback and by the server function as the authoritative check.
import { z } from "zod";
import { DIVISION_SLUGS } from "./site-content";

export const MAX_ATTACHMENTS = 10;
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10 MB, matches the storage bucket limit
export const ALLOWED_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/dwg",
  "image/vnd.dwg",
  "application/acad",
  "application/dxf",
  "image/vnd.dxf",
] as const;
export const ATTACHMENT_ACCEPT = ".jpg,.jpeg,.png,.webp,.heic,.pdf,.doc,.docx,.xls,.xlsx,.dwg,.dxf";

/** Rate limit for public forms: submissions allowed per email address per rolling hour. */
export const SUBMISSIONS_PER_EMAIL_PER_HOUR = 5;

export const REQUEST_TYPES = ["quotation", "consultation"] as const;
export type RequestType = (typeof REQUEST_TYPES)[number];

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  quotation: "Request a quotation",
  consultation: "Technical consultation / site assessment",
};

export const PREFERRED_CHANNELS = ["email", "phone", "whatsapp"] as const;
export const CHANNEL_LABELS: Record<(typeof PREFERRED_CHANNELS)[number], string> = {
  email: "Email",
  phone: "Telephone",
  whatsapp: "WhatsApp",
};

export const INSTALLATION_TYPES = ["new", "upgrade", "not_sure"] as const;
export const INSTALLATION_LABELS: Record<(typeof INSTALLATION_TYPES)[number], string> = {
  new: "New installation",
  upgrade: "Upgrade / extension of existing system",
  not_sure: "Not sure yet",
};

export const FACILITY_TYPES = [
  "Office building",
  "Embassy / diplomatic premises",
  "Government building",
  "Bank / financial branch",
  "Data centre / server room",
  "Hotel / conference venue",
  "Warehouse / industrial",
  "Residential",
  "Other",
] as const;

export const SITE_TYPES = [
  "Single building",
  "Multi-building campus",
  "Single floor / tenancy",
  "Specific room(s)",
  "Multiple sites",
] as const;

export const ATTACHMENT_CATEGORIES = ["attachment", "site_photo", "technical_document"] as const;
export type AttachmentCategory = (typeof ATTACHMENT_CATEGORIES)[number];
export const ATTACHMENT_CATEGORY_LABELS: Record<AttachmentCategory, string> = {
  attachment: "General attachment",
  site_photo: "Site photograph",
  technical_document: "Technical document",
};

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { message: `Must be ${max} characters or fewer` })
    .optional()
    .transform((v) => (v ? v : undefined));

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Use a valid date" })
  .optional()
  .or(z.literal("").transform(() => undefined));

export const clientDetailsSchema = z
  .object({
    clientType: z.enum(["individual", "organization"]),
    organizationName: optionalText(160),
    contactName: z.string().trim().min(2, { message: "Enter the contact person's name" }).max(120),
    email: z.string().trim().toLowerCase().email({ message: "Enter a valid email address" }).max(255),
    phone: z
      .string()
      .trim()
      .min(7, { message: "Enter a valid telephone number" })
      .max(32)
      .regex(/^[+()\d\s-]+$/, { message: "Use digits, spaces, +, - or brackets only" }),
    country: z.string().trim().min(2, { message: "Enter your country" }).max(80),
    preferredChannel: z.enum(PREFERRED_CHANNELS),
  })
  .refine((v) => v.clientType === "individual" || !!v.organizationName, {
    path: ["organizationName"],
    message: "Enter the organisation name",
  });

export const serviceRequirementsSchema = z.object({
  serviceCategory: z.enum(DIVISION_SLUGS, { errorMap: () => ({ message: "Choose a service category" }) }),
  subcategory: z.string().trim().min(2, { message: "Choose a subcategory" }).max(120),
  projectTitle: z.string().trim().min(4, { message: "Give the project a short title" }).max(160),
  description: z
    .string()
    .trim()
    .min(20, { message: "Describe your requirements in at least 20 characters" })
    .max(4000),
  facilityType: z.string().trim().min(2, { message: "Choose a facility type" }).max(80),
  projectSize: optionalText(200),
});

export const siteInformationSchema = z.object({
  siteCountry: z.string().trim().min(2, { message: "Enter the project country" }).max(80),
  siteCity: z.string().trim().min(2, { message: "Enter the city" }).max(80),
  siteAddress: optionalText(300),
  siteType: z.string().trim().min(2, { message: "Choose a site type" }).max(80),
  installationType: z.enum(INSTALLATION_TYPES),
  preferredVisitDate: isoDate,
});

export const additionalInfoSchema = z.object({
  estimatedBudget: optionalText(120),
  desiredCompletionDate: isoDate,
  additionalComments: optionalText(2000),
});

export const attachmentMetaSchema = z.object({
  category: z.enum(ATTACHMENT_CATEGORIES),
  name: z.string().trim().min(1).max(200),
  type: z.enum(ALLOWED_ATTACHMENT_TYPES, {
    errorMap: () => ({ message: "Unsupported file type" }),
  }),
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_ATTACHMENT_BYTES, { message: "Each file must be 10 MB or smaller" }),
});
export type AttachmentMeta = z.infer<typeof attachmentMetaSchema>;

export const serviceRequestSchema = z.object({
  requestType: z.enum(REQUEST_TYPES),
  client: clientDetailsSchema,
  service: serviceRequirementsSchema,
  site: siteInformationSchema,
  additional: additionalInfoSchema,
  attachments: z
    .array(attachmentMetaSchema)
    .max(MAX_ATTACHMENTS, { message: `Attach up to ${MAX_ATTACHMENTS} files` })
    .default([]),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Please confirm consent to process your information" }),
  }),
  /** Honeypot: real visitors never fill this hidden field. */
  website: z.string().max(0).optional().or(z.literal("")),
});
export type ServiceRequestInput = z.input<typeof serviceRequestSchema>;
export type ServiceRequestData = z.output<typeof serviceRequestSchema>;

export const trackingTokenSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{40,64}$/, { message: "Invalid tracking code" }),
});

/** Maps a browser File's MIME type, falling back to its extension (some browsers leave CAD/HEIC types empty). */
export function resolveMimeType(name: string, type: string): string {
  if (type) return type;
  const ext = name.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    dwg: "image/vnd.dwg",
    dxf: "image/vnd.dxf",
    heic: "image/heic",
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  return (ext && map[ext]) || "application/octet-stream";
}

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  new: "Received",
  under_review: "Under review",
  awaiting_information: "Awaiting information",
  assessment_scheduled: "Assessment scheduled",
  assessment_completed: "Assessment completed",
  quotation_preparation: "Quotation in preparation",
  quotation_sent: "Quotation sent",
  approved: "Approved",
  rejected: "Not proceeding",
  cancelled: "Cancelled",
};

export const REQUEST_STATUS_FLOW = [
  "new",
  "under_review",
  "assessment_scheduled",
  "assessment_completed",
  "quotation_preparation",
  "quotation_sent",
  "approved",
] as const;

export const contactEnquirySchema = z.object({
  name: z.string().trim().min(2, { message: "Enter your name" }).max(120),
  email: z.string().trim().toLowerCase().email({ message: "Enter a valid email address" }).max(255),
  phone: optionalText(32),
  organization: optionalText(160),
  subject: z.string().trim().min(3, { message: "Enter a subject" }).max(160),
  message: z.string().trim().min(10, { message: "Your message should be at least 10 characters" }).max(3000),
  website: z.string().max(0).optional().or(z.literal("")),
});
export type ContactEnquiryInput = z.input<typeof contactEnquirySchema>;
