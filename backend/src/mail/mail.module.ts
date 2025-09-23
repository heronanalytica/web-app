import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { MailProviderFactory } from './mail-provider.factory';

import { DatabaseModule } from '../database/database.module';
import { SenderNetService } from './providers/sender-net.service';
// 🚀 Future: import { MailchimpService } from './providers/mailchimp.service';
// 🚀 Future: import { HubspotService } from './providers/hubspot.service';

@Module({
  imports: [DatabaseModule, ConfigModule],
  controllers: [MailController],
  providers: [
    MailService,
    MailProviderFactory,
    SenderNetService,
    // 🚀 Future: MailchimpService,
    // 🚀 Future: HubspotService,
  ],
  exports: [MailService, MailProviderFactory],
})
export class MailModule {}
