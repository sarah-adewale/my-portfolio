import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MailModule } from '@nestjs/mail';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { ArticlesModule } from './articles/articles.module.js';
import { ContactModule } from './contact/contact.module.js';
import { envSchema, type Env } from './env.js';
import { mailTransport } from './mail.js';
import { ProjectsModule } from './projects/projects.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envSchema }),
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60_000, limit: 60 }] }),
    MailModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        transport: mailTransport(config),
        from: config.get('MAIL_FROM', { infer: true }),
      }),
    }),
    ArticlesModule,
    ContactModule,
    ProjectsModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
