import { z } from 'zod';

export const envSchema = z
  .object({
    PORT: z.coerce.number().default(4000),
    // Origin of the Next.js app, allowed by CORS
    WEB_ORIGIN: z.string().default('http://localhost:3000'),
    // `log` prints mails to the console, for local development
    MAIL_TRANSPORT: z.enum(['log', 'smtp', 'resend']).default('log'),
    MAIL_FROM: z.string().default('Portfolio <no-reply@localhost>'),
    CONTACT_INBOX: z.string().default('sarahtemitopeadewale@gmail.com'),
    SMTP_URL: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    if (env.MAIL_TRANSPORT === 'smtp' && !env.SMTP_URL) {
      ctx.addIssue({ code: 'custom', path: ['SMTP_URL'], message: 'Required when MAIL_TRANSPORT=smtp' });
    }
    if (env.MAIL_TRANSPORT === 'resend' && !env.RESEND_API_KEY) {
      ctx.addIssue({ code: 'custom', path: ['RESEND_API_KEY'], message: 'Required when MAIL_TRANSPORT=resend' });
    }
  });

export type Env = z.infer<typeof envSchema>;
