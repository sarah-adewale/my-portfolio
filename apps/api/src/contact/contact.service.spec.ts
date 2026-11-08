import { ConfigService } from '@nestjs/config';
import { Mailer } from '@nestjs/mail';
import { Test } from '@nestjs/testing';
import { ContactService } from './contact.service.js';

describe('ContactService', () => {
  let service: ContactService;
  const send = vi.fn();

  beforeEach(async () => {
    send.mockReset();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ContactService,
        { provide: Mailer, useValue: { send } },
        { provide: ConfigService, useValue: { get: () => 'inbox@example.com' } },
      ],
    }).compile();

    service = moduleRef.get(ContactService);
  });

  it('emails the message to the inbox with the sender as reply-to', async () => {
    await service.send({ name: 'Ada', email: 'ada@example.com', message: 'Hello there, Sarah!' });

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'inbox@example.com',
        replyTo: { name: 'Ada', address: 'ada@example.com' },
      }),
    );
  });

  it('drops submissions that fill in the honeypot', async () => {
    await service.send({ name: 'Bot', email: 'bot@example.com', message: 'Buy my stuff now', website: 'spam.example' });

    expect(send).not.toHaveBeenCalled();
  });
});
