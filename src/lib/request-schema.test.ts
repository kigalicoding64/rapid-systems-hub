import { describe, expect, it } from "vitest";
import {
  MAX_ATTACHMENT_BYTES,
  SUBMISSIONS_PER_EMAIL_PER_HOUR,
  clientDetailsSchema,
  serviceRequestSchema,
  trackingTokenSchema,
} from "./request-schema";

const valid = {
  requestType: "quotation",
  client: {
    clientType: "organization",
    organizationName: "Example Ltd",
    contactName: "Jane Doe",
    email: "jane@example.com",
    phone: "+256 700 000000",
    country: "Uganda",
    preferredChannel: "email",
  },
  service: {
    serviceCategory: "security-systems",
    subcategory: "IP CCTV & Video Analytics",
    projectTitle: "Head office CCTV",
    description: "Install IP cameras across three floors and the car park.",
    facilityType: "Office building",
    projectSize: "24 cameras",
  },
  site: { siteCountry: "Uganda", siteCity: "Kampala", siteType: "Single building", installationType: "new" },
  additional: {},
  attachments: [],
  consent: true,
} as const;

const file = (size: number) => ({ category: "site_photo", name: "photo.jpg", type: "image/jpeg", size });

describe("service request rules", () => {
  it("accepts a complete CCTV quotation request", () => {
    expect(serviceRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("requires consent to process the submitted information", () => {
    expect(serviceRequestSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
  });

  it("requires an organisation name when requesting as an organisation", () => {
    const r = clientDetailsSchema.safeParse({ ...valid.client, organizationName: "" });
    expect(r.success).toBe(false);
  });

  it("does not require an organisation name for individuals", () => {
    const r = clientDetailsSchema.safeParse({ ...valid.client, clientType: "individual", organizationName: "" });
    expect(r.success).toBe(true);
  });

  it("limits each attachment to 10 MB", () => {
    expect(MAX_ATTACHMENT_BYTES).toBe(10 * 1024 * 1024);
    expect(serviceRequestSchema.safeParse({ ...valid, attachments: [file(10 * 1024 * 1024)] }).success).toBe(true);
    expect(serviceRequestSchema.safeParse({ ...valid, attachments: [file(10 * 1024 * 1024 + 1)] }).success).toBe(false);
  });

  it("allows at most 10 attachments", () => {
    expect(serviceRequestSchema.safeParse({ ...valid, attachments: Array(10).fill(file(1000)) }).success).toBe(true);
    expect(serviceRequestSchema.safeParse({ ...valid, attachments: Array(11).fill(file(1000)) }).success).toBe(false);
  });

  it("rejects submissions that fill the hidden honeypot field", () => {
    expect(serviceRequestSchema.safeParse({ ...valid, website: "spam" }).success).toBe(false);
  });

  it("allows 5 submissions per email address per hour", () => {
    expect(SUBMISSIONS_PER_EMAIL_PER_HOUR).toBe(5);
  });

  it("only accepts long random tracking tokens, never short or sequential ids", () => {
    expect(trackingTokenSchema.safeParse({ token: "123" }).success).toBe(false);
    expect(trackingTokenSchema.safeParse({ token: "a".repeat(43) }).success).toBe(true);
  });
});
