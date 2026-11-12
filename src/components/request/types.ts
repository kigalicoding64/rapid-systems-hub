import type { AttachmentCategory, RequestType } from "@/lib/request-schema";
import type { DivisionSlug } from "@/lib/site-content";

export interface SelectedFile {
  id: string;
  file: File;
  category: AttachmentCategory;
}

export interface RequestFormState {
  requestType: RequestType;
  client: {
    clientType: "individual" | "organization";
    organizationName: string;
    contactName: string;
    email: string;
    phone: string;
    country: string;
    preferredChannel: "email" | "phone" | "whatsapp";
  };
  service: {
    serviceCategory: DivisionSlug | "";
    subcategory: string;
    projectTitle: string;
    description: string;
    facilityType: string;
    projectSize: string;
  };
  site: {
    siteCountry: string;
    siteCity: string;
    siteAddress: string;
    siteType: string;
    installationType: "new" | "upgrade" | "not_sure";
    preferredVisitDate: string;
  };
  additional: {
    estimatedBudget: string;
    desiredCompletionDate: string;
    additionalComments: string;
  };
  files: SelectedFile[];
  consent: boolean;
  website: string;
}

export type FieldErrors = Record<string, string>;

export interface StepProps {
  state: RequestFormState;
  errors: FieldErrors;
  update: <K extends "client" | "service" | "site" | "additional">(
    section: K,
    patch: Partial<RequestFormState[K]>,
  ) => void;
}
