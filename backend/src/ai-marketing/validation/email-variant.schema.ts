import { z } from 'zod';

export const EmailVariantSchema = z.object({
  subject: z.string().min(1).max(150),
  preheader: z.string().min(1).max(150),
  html: z.string().min(30),
});

export type EmailVariant = z.infer<typeof EmailVariantSchema>;
