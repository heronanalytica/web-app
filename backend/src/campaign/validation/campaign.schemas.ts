import { z } from 'zod';

export const AnalysisStepSchema = z.object({
  key: z.string(),
  label: z.string(),
  status: z.enum(['waiting', 'in_progress', 'done', 'error']),
});

export const StepSummarySchema = z.object({
  totalRecipients: z.number().optional(),
  byPersona: z.record(z.string(), z.number()).optional(),
});

export const GeneratorBriefSchema = z.object({
  objective: z.string(),
  tone: z.string(),
  businessResults: z.string(),
  keyMessages: z.string(),
  cta: z.string(),
  photoFileId: z.string().uuid().optional(),
  uploadedHtml: z.string().optional(),
});

export const CustomerFileSchema = z.object({
  fileId: z.string().uuid(),
  fileName: z.string(),
});

export const MailServiceSchema = z.object({
  provider: z.string(),
  connected: z.boolean(),
  mailProviderId: z.string().uuid(),
  listId: z.string().optional(),
  fromName: z.string().optional(),
  replyTo: z.string().email().optional(),
  scheduleIso: z.string().datetime().optional(),
});

export const ClassifiedPersonaFileSchema = z.object({
  fileId: z.string().uuid(),
  fileName: z.string(),
});

export const CommonTemplateSchema = z.object({
  subject: z.string(),
  preheader: z.string(),
  html: z.string(),
});

// Avoid strictly validating CompanyProfile recursively here to prevent circular loops
export const LightCompanyProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  userId: z.string().uuid(),
  website: z.string(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  designAssetFileId: z.string().uuid().nullable().optional(),
  marketingContentFileId: z.string().uuid().nullable().optional(),
});

export const CampaignStepStateSchema = z.object({
  generator: GeneratorBriefSchema.optional(),
  customerFile: CustomerFileSchema.optional(),
  mailService: MailServiceSchema.optional(),
  classifiedPersonaFile: ClassifiedPersonaFileSchema.optional(),
  companyProfile: LightCompanyProfileSchema.optional(),
  commonTemplate: CommonTemplateSchema.optional(),
  summary: StepSummarySchema.optional(),
  launched: z.boolean().optional(),
});

export type AnalysisStep = z.infer<typeof AnalysisStepSchema>;
export type CampaignStepState = z.infer<typeof CampaignStepStateSchema>;
