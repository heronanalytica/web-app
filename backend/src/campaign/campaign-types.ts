export interface ProcessedRecipient {
  id: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  campaignId: string;
  contact: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    displayName: string | null; // Computed from firstName and lastName
  } | null;
  personaCode: string | null;
  personaDisplayName: string | null;
  renderedEmail: {
    id: string;
    subject: string | null;
    preheader: string | null;
    html?: string | null;
    from?: string | null;
    to?: string | null;
    rationale?: any;
  } | null;
}
