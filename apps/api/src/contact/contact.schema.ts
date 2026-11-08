import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email(),
  message: z.string().trim().min(10).max(5000),
  // Honeypot: hidden in the form, so only bots fill it in
  website: z.string().optional(),
});

export type ContactDto = z.infer<typeof contactSchema>;
