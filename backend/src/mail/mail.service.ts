import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { Request } from 'express';
import * as crypto from 'crypto';
import { MailProviderFactory, MailProviderType } from './mail-provider.factory';
import {
  IMailProvider,
  Recipient,
  SendCampaignOptions,
  SendResult,
} from './mail-provider.interface';
import { getMailProviders } from './mailProviders';
import { OAuthTokenResponse } from './mail.type';
import { Campaign, Prisma } from 'generated/prisma';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly configService: ConfigService,
    private readonly mailProviderFactory: MailProviderFactory,
  ) {}

  private getProvider(
    providerType: MailProviderType = MailProviderType.DEFAULT,
  ): IMailProvider {
    return this.mailProviderFactory.getProvider(providerType);
  }

  // ----------- CAMPAIGN SENDING -----------
  async sendCampaign(
    campaign: Campaign,
    recipients: Array<Recipient>,
    providerType: MailProviderType = MailProviderType.DEFAULT,
  ): Promise<SendResult> {
    const provider = this.getProvider(providerType);

    const options: SendCampaignOptions = { campaign, recipients };

    try {
      this.logger.log(`Sending campaign via ${providerType}`);
      const result = await provider.sendCampaign(options);

      if (!result.success) {
        this.logger.warn(
          `Campaign sent with warnings: ${result.message}`,
          result.data,
        );
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to send campaign via ${providerType}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      return {
        success: false,
        message: errorMessage,
        data: { campaignId: campaign?.id, recipientsCount: recipients?.length },
      };
    }
  }

  async testConnection(
    providerType: MailProviderType = MailProviderType.DEFAULT,
  ): Promise<boolean> {
    try {
      this.logger.log(`Testing connection to ${providerType}`);
      const provider = this.getProvider(providerType);
      return await provider.testConnection();
    } catch (error) {
      this.logger.error(
        `Connection test failed for ${providerType}`,
        error instanceof Error ? error.stack : undefined,
      );
      return false;
    }
  }

  // ----------- OAUTH FLOW -----------
  getOAuthUrl(provider: string, req: Request): string {
    const userId = (req.user as { id: string })?.id;
    if (!userId) throw new UnauthorizedException('Missing user ID');

    const providerConfig = getMailProviders()[provider];
    if (!providerConfig || !providerConfig.redirectUri) {
      throw new UnauthorizedException('Unsupported provider');
    }

    const state = this.generateState(userId);
    return `${providerConfig.authUrl}?response_type=code&client_id=${providerConfig.clientId}&redirect_uri=${encodeURIComponent(providerConfig.redirectUri)}&state=${state}&scope=${providerConfig.scope ? encodeURIComponent(providerConfig.scope) : ''}`;
  }

  async handleOAuthCallback(
    provider: string,
    code: string,
    state: string,
  ): Promise<OAuthTokenResponse> {
    const userId = this.verifyState(state);
    if (!userId) throw new UnauthorizedException('Invalid or expired state');

    const providerConfig = getMailProviders()[provider];
    if (!providerConfig) {
      throw new UnauthorizedException('Unsupported provider');
    }

    const tokenData = await this.exchangeCodeForToken(provider, code);

    await this.db.mailProviderToken.upsert({
      where: { userId_provider: { userId, provider } },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : null,
        meta: tokenData as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
      create: {
        userId,
        provider,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : null,
        meta: tokenData as Prisma.InputJsonValue,
      },
    });

    return tokenData;
  }

  async getStatus(
    userId: string,
  ): Promise<
    Record<
      string,
      { connected: boolean; meta?: unknown; mailProviderId: string }
    >
  > {
    const tokens = await this.db.mailProviderToken.findMany({
      where: { userId },
      select: { provider: true, meta: true, id: true },
    });
    const status: Record<string, any> = {};
    for (const t of tokens) {
      status[t.provider] = {
        connected: true,
        meta: t.meta,
        mailProviderId: t.id,
      };
    }
    return status;
  }

  async disconnectProvider(
    provider: string,
    userId: string,
  ): Promise<{ success: boolean }> {
    await this.db.mailProviderToken.deleteMany({ where: { userId, provider } });
    return { success: true };
  }

  // ----------- INTERNAL HELPERS -----------
  private generateState(userId: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(16).toString('hex');
    const data = `${userId}:${timestamp}:${random}`;
    const hmac = crypto.createHmac(
      'sha256',
      this.configService.get<string>('APP_SECRET') || 'default-secret',
    );
    const signature = hmac.update(data).digest('hex');
    return `${data}:${signature}`;
  }

  private verifyState(state: string): string | null {
    try {
      const parts = state.split(':');
      if (parts.length < 4) return null;

      const [userId, timestamp, random, signature] = [
        parts[0],
        parts[1],
        parts[2],
        parts.slice(3).join(':'), // in case signature contains ':'
      ];

      // expiry: 10 mins
      if (Date.now() - parseInt(timestamp, 10) > 10 * 60 * 1000) return null;

      const hmac = crypto.createHmac(
        'sha256',
        this.configService.get<string>('APP_SECRET') || 'default-secret',
      );
      const expectedSignature = hmac
        .update(`${userId}:${timestamp}:${random}`)
        .digest('hex');

      if (
        !crypto.timingSafeEqual(
          Buffer.from(signature, 'hex'),
          Buffer.from(expectedSignature, 'hex'),
        )
      ) {
        return null;
      }
      return userId;
    } catch {
      return null;
    }
  }

  private async exchangeCodeForToken(
    provider: string,
    code: string,
  ): Promise<OAuthTokenResponse> {
    const providerConfig = getMailProviders()[provider];
    if (!providerConfig) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    if (!providerConfig.tokenUrl || !providerConfig.redirectUri) {
      throw new Error(`Provider ${provider} does not support OAuth`);
    }

    const response = await fetch(providerConfig.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${providerConfig.clientId}:${providerConfig.clientSecret}`,
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: providerConfig.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed token exchange: ${response.status} ${response.statusText}`,
      );
    }

    const tokenData = (await response.json()) as OAuthTokenResponse;
    return tokenData;
  }
}
