import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IMailProvider } from './mail-provider.interface';
import { getMailProviders } from './mailProviders';
import { SenderNetService } from './providers/sender-net.service';

export enum MailProviderType {
  SENDER_NET = 'sendernet',
  MAILCHIMP = 'mailchimp',
  HUBSPOT = 'hubspot',
  DEFAULT = 'default',
}

@Injectable()
export class MailProviderFactory implements OnModuleInit {
  private readonly logger = new Logger(MailProviderFactory.name);
  private readonly providers = new Map<MailProviderType, IMailProvider>();

  constructor(
    private readonly configService: ConfigService,
    private readonly senderNetService: SenderNetService, // inject actual service
    // later you can inject MailchimpService, HubspotService, etc.
  ) {}

  onModuleInit() {
    this.initializeProviders();
  }

  private initializeProviders() {
    const providerConfigs = getMailProviders();

    // Register Sender.net
    if (providerConfigs.sendernet) {
      this.registerProvider(MailProviderType.SENDER_NET, this.senderNetService);
    }

    // 🚀 Future: When you implement MailchimpService
    // if (providerConfigs.mailchimp) {
    //   this.registerProvider(MailProviderType.MAILCHIMP, this.mailchimpService);
    // }

    // 🚀 Future: When you implement HubspotService
    // if (providerConfigs.hubspot) {
    //   this.registerProvider(MailProviderType.HUBSPOT, this.hubspotService);
    // }

    // Default provider from env or fallback
    const defaultProvider =
      (this.configService.get<string>(
        'DEFAULT_MAIL_PROVIDER',
      ) as MailProviderType) || MailProviderType.SENDER_NET;

    this.registerProvider(
      MailProviderType.DEFAULT,
      this.getProvider(defaultProvider),
    );

    this.logger.log(
      `Mail providers initialized. Default: ${defaultProvider.toUpperCase()}`,
    );
  }

  private registerProvider(type: MailProviderType, provider: IMailProvider) {
    this.providers.set(type, provider);
    this.logger.log(`Registered mail provider: ${type}`);
  }

  getProvider(
    type: MailProviderType = MailProviderType.DEFAULT,
  ): IMailProvider {
    const provider = this.providers.get(type);

    if (!provider) {
      this.logger.warn(
        `No provider found for type: ${type}. Using default provider.`,
      );
      return this.providers.get(MailProviderType.DEFAULT) as IMailProvider;
    }

    return provider;
  }
}
