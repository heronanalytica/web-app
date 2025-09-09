/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { getMailProviders } from './mailProviders';
import axios from 'axios';

import { DatabaseService } from '../database/database.service';
import { Request } from 'express';

@Injectable()
export class MailService {
  constructor(private readonly db: DatabaseService) {}

  getOAuthUrl(provider: string, req: Request): string {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }

    const config = getMailProviders()[provider];
    const state = this.generateState(userId);
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      state,
      // Add scope if required
    });
    return `${config.authUrl}?${params.toString()}`;
  }

  async handleOAuthCallback(provider: string, code: string, userId: string) {
    const config = getMailProviders()[provider];
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      code,
    });
    // Exchange code for token
    const res = await axios.post(config.tokenUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const tokenData: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    } = res.data;
    // Store or update token in DB for user
    await this.db.mailProviderToken.upsert({
      where: { userId_provider: { userId, provider } },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : null,
        meta: tokenData,
      },
      create: {
        userId,
        provider,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : null,
        meta: tokenData,
      },
    });
    return tokenData;
  }

  async getStatus(userId: string) {
    // Query DB for all connected providers for this user
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

  async disconnectProvider(provider: string, userId: string) {
    await this.db.mailProviderToken.deleteMany({
      where: { userId, provider },
    });
    return { success: true };
  }

  private generateState(userId: string) {
    // TODO: Implement secure state (CSRF protection)
    return userId + ':' + Date.now();
  }
}
