import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { contactSchema, type ContactDto } from './contact.schema.js';
import { ContactService } from './contact.service.js';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(202)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  async create(@Body({ schema: contactSchema }) dto: ContactDto) {
    await this.contactService.send(dto);
    return { ok: true };
  }
}
