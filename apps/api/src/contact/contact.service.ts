import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { html, Mailer } from '@nestjs/mail';
import type { Env } from '../env.js';
import type { ContactDto } from './contact.schema.js';

@Injectable()
export class ContactService {
  constructor(
    private readonly mailer: Mailer,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async send({ name, email, message, website }: ContactDto) {
    // Pretend a bot's submission went through, so it doesn't retry
    if (website) return;

    await this.mailer.send({
      to: this.config.get('CONTACT_INBOX', { infer: true }),
      replyTo: { name, address: email },
      subject: `Portfolio message from ${name}`,
      html: html`<p><strong>${name}</strong> (${email}) wrote:</p><p style="white-space:pre-wrap">${message}</p>`,
    });
  }
}
