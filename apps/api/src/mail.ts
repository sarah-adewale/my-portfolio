import { ConfigService } from '@nestjs/config';
import { LogMailTransport, MailTransport, ResendTransport, SmtpTransport } from '@nestjs/mail';
import type { Env } from './env.js';

export function mailTransport(config: ConfigService<Env, true>): MailTransport {
  switch (config.get('MAIL_TRANSPORT', { infer: true })) {
    case 'smtp':
      return new SmtpTransport({ url: config.getOrThrow('SMTP_URL', { infer: true }) });
    case 'resend':
      return new ResendTransport({ apiKey: config.getOrThrow('RESEND_API_KEY', { infer: true }) });
    default:
      return new LogMailTransport();
  }
}
