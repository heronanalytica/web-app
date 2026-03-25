// backend/src/mail/providers/sender-net.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosInstance } from 'axios';
import * as crypto from 'crypto';
import {
  IMailProvider,
  MailProviderConfig,
  SendCampaignOptions,
  SendResult,
} from '../mail-provider.interface';

interface SenderNetErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

type SenderNetAxiosError = AxiosError<SenderNetErrorResponse>;

// --- Standard envelope for v2 responses
interface SenderNetResponse<T> {
  success: boolean;
  message: string[] | string;
  data: T;
}

// --- Specific response types
interface SenderNetGroup {
  id: string;
  title: string;
}

interface SenderNetSubscriber {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
}

interface SenderNetCampaign {
  id: string;
  subject: string;
  title: string;
  recipient_count?: number;
}

type RecipientIdentity = {
  firstname: string;
  lastname: string;
};

@Injectable()
export class SenderNetService implements IMailProvider {
  private readonly logger = new Logger(SenderNetService.name);
  private readonly config: MailProviderConfig;
  private readonly apiBaseUrl = 'https://api.sender.net/v2';
  private readonly http: AxiosInstance;
  private static readonly MAX_GROUP_CREATE_ATTEMPTS = 5;
  private static readonly RECIPIENT_WAIT_ATTEMPTS = 5;
  private static readonly RECIPIENT_WAIT_DELAY_MS = 1500;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      apiKey: this.configService.get<string>('SENDER_NET_TOKEN') || '',
      senderEmail: this.configService.get<string>('SENDER_EMAIL') || '',
      senderName:
        this.configService.get<string>('SENDER_NAME') || 'HeronAnalytica',
    };

    this.http = axios.create({
      baseURL: this.apiBaseUrl,
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  // -----------------------------
  // Groups
  // -----------------------------
  private buildRecipientGroupBaseTitle(
    campaignId: string,
    email: string,
  ): string {
    const emailHash = crypto
      .createHash('sha1')
      .update(email.trim().toLowerCase())
      .digest('hex')
      .slice(0, 12);

    return `cmp-${campaignId.slice(0, 8)}-${emailHash}`;
  }

  private buildAttemptGroupTitle(baseTitle: string, attempt: number): string {
    if (attempt === 0) {
      return baseTitle;
    }

    const suffix = crypto.randomBytes(3).toString('hex');
    return `${baseTitle}-${suffix}`;
  }

  private buildRecipientIdentity(name?: string): RecipientIdentity {
    const [firstname, ...rest] = name?.split(' ') || [''];
    return {
      firstname,
      lastname: rest.join(' '),
    };
  }

  private async createOrGetGroup(baseTitle: string): Promise<string> {
    for (
      let attempt = 0;
      attempt < SenderNetService.MAX_GROUP_CREATE_ATTEMPTS;
      attempt++
    ) {
      const title = this.buildAttemptGroupTitle(baseTitle, attempt);

      try {
        const resp = await this.http.post<SenderNetResponse<SenderNetGroup>>(
          '/groups',
          { title },
        );
        return resp.data.data.id;
      } catch (err) {
        const axiosErr = err as SenderNetAxiosError;
        if (
          typeof axiosErr.response?.data?.message === 'string' &&
          axiosErr.response.data.message.includes('already exists')
        ) {
          this.logger.warn(
            `Sender group title collision for "${title}", retrying with a new suffix`,
          );
          continue;
        }
        throw err;
      }
    }

    throw new Error(
      `Unable to create a unique Sender group for base title "${baseTitle}"`,
    );
  }

  // -----------------------------
  // Subscribers
  // -----------------------------
  private async findSubscriberByEmail(
    email: string,
  ): Promise<SenderNetSubscriber | null> {
    const subsResp = await this.http.get<
      SenderNetResponse<SenderNetSubscriber[]>
    >('/subscribers', { params: { email } });
    return (
      subsResp.data.data.find(
        (subscriber) => subscriber.email.toLowerCase() === email.toLowerCase(),
      ) ?? null
    );
  }

  private async createOrUpdateSubscriber(
    email: string,
    firstname: string,
    lastname: string,
    groupId: string,
  ): Promise<string> {
    try {
      const resp = await this.http.post<SenderNetResponse<SenderNetSubscriber>>(
        '/subscribers',
        {
          email,
          firstname,
          lastname,
          groups: [groupId],
          trigger_automation: false,
        },
      );
      return resp.data.data.id;
    } catch (err) {
      const axiosErr = err as SenderNetAxiosError;
      if (
        typeof axiosErr.response?.data?.message === 'string' &&
        axiosErr.response.data.message.includes('already exists')
      ) {
        // Fetch subscriber by email
        const found = await this.findSubscriberByEmail(email);
        if (!found)
          throw new Error(`Subscriber ${email} exists but not retrievable`);

        // Update the existing subscriber so Sender associates it with this group.
        await this.http.patch(`/subscribers/${found.id}`, {
          email,
          firstname,
          lastname,
          groups: [groupId],
          trigger_automation: false,
        });

        return found.id;
      }
      throw err;
    }
  }

  private async ensureRecipientGroup(
    campaignId: string,
    email: string,
  ): Promise<string> {
    const baseTitle = this.buildRecipientGroupBaseTitle(campaignId, email);
    return this.createOrGetGroup(baseTitle);
  }

  private async ensureSubscriberForGroup(
    email: string,
    identity: RecipientIdentity,
    groupId: string,
  ): Promise<string> {
    return this.createOrUpdateSubscriber(
      email,
      identity.firstname,
      identity.lastname,
      groupId,
    );
  }

  private async createPersonalizedCampaign(
    campaignName: string,
    recipientEmail: string,
    groupId: string,
    subject: string,
    fromName: string,
    fromEmail: string,
    preheader: string,
    html: string,
  ): Promise<string> {
    const campaignResp = await this.http.post<
      SenderNetResponse<SenderNetCampaign>
    >('/campaigns', {
      title: `${campaignName} - ${recipientEmail}`,
      subject: subject || 'Your Campaign',
      from: fromName || this.config.senderName,
      reply_to: fromEmail || this.config.senderEmail,
      preheader,
      content_type: 'html',
      content: html || '<p>No Content</p>',
      groups: [groupId],
    });

    if (!campaignResp.data.success) {
      throw new Error(
        `Campaign creation failed: ${JSON.stringify(campaignResp.data.message)}`,
      );
    }

    this.logger.debug('Created campaign', campaignResp.data);
    return campaignResp.data.data.id;
  }

  private async sendCreatedCampaign(campaignId: string): Promise<void> {
    const sendResp = await this.http.post(`/campaigns/${campaignId}/send`);
    this.logger.debug('SendResp', sendResp.data);
  }

  // -----------------------------
  // Main Send Flow
  // -----------------------------
  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async waitForRecipients(
    campaignId: string,
    expectedMinimum = 1,
    attempts = SenderNetService.RECIPIENT_WAIT_ATTEMPTS,
    delayMs = SenderNetService.RECIPIENT_WAIT_DELAY_MS,
  ): Promise<void> {
    for (let attempt = 1; attempt <= attempts; attempt++) {
      const resp = await this.http.get<SenderNetResponse<SenderNetCampaign>>(
        `/campaigns/${campaignId}`,
      );
      const recipientCount = resp.data.data.recipient_count ?? 0;

      if (recipientCount >= expectedMinimum) {
        return;
      }

      if (attempt < attempts) {
        this.logger.debug(
          `Waiting for Sender campaign ${campaignId} recipients (${recipientCount}/${expectedMinimum})`,
        );
        await this.sleep(delayMs);
      }
    }

    throw new Error(
      `Sender campaign ${campaignId} still has no selected recipients after waiting`,
    );
  }

  async sendCampaign(options: SendCampaignOptions): Promise<SendResult> {
    const { campaign, recipients } = options;
    const results: SendResult[] = [];

    for (const recipient of recipients) {
      try {
        const identity = this.buildRecipientIdentity(recipient.name);
        const groupId = await this.ensureRecipientGroup(
          campaign.id,
          recipient.email,
        );
        const subscriberId = await this.ensureSubscriberForGroup(
          recipient.email,
          identity,
          groupId,
        );
        const senderCampaignId = await this.createPersonalizedCampaign(
          campaign.name,
          recipient.email,
          groupId,
          recipient.subject,
          recipient.fromName,
          recipient.fromEmail,
          recipient.preheader || '',
          recipient.html,
        );
        await this.waitForRecipients(senderCampaignId);
        await this.sendCreatedCampaign(senderCampaignId);

        results.push({
          success: true,
          message: `Sent campaign to ${recipient.email}`,
          data: {
            campaignId: senderCampaignId,
            groupId,
            subscriberId,
          },
        });
      } catch (error) {
        results.push({
          success: false,
          message: this.getErrorMessage(error),
          data: this.getErrorData(error),
        });
      }
    }

    return {
      success: results.every((r) => r.success),
      message: `Sent ${results.filter((r) => r.success).length}/${recipients.length} personalized campaigns`,
      data: { results },
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      this.logger.log('Testing Sender.net connection...');
      const response = await this.http.get('/account');
      return response.status === 200;
    } catch (error) {
      this.logger.error('Error testing Sender.net connection', {
        error: this.getErrorMessage(error),
        errorData: this.getErrorData(error),
      });
      return false;
    }
  }

  private getErrorMessage(error: unknown): string {
    if (this.isAxiosError(error)) {
      const axiosError = error;
      const data = axiosError.response?.data;
      if (data?.message) {
        return JSON.stringify(data.message); // instead of showing [Object]
      }
      return axiosError.message || 'Unknown error from Sender.net';
    }
    if (error instanceof Error) return error.message;
    return 'Unknown error';
  }

  private getErrorData(error: unknown): Record<string, unknown> | undefined {
    if (this.isAxiosError(error)) {
      const axiosError = error;
      return {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        code: axiosError.code,
        config: {
          url: axiosError.config?.url,
          method: axiosError.config?.method,
        },
      };
    }
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
    return { rawError: error };
  }

  private isAxiosError(error: unknown): error is SenderNetAxiosError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'isAxiosError' in error &&
      (error as { isAxiosError: boolean }).isAxiosError === true
    );
  }
}
