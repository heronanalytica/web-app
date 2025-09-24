// backend/src/mail/providers/sender-net.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosInstance } from 'axios';
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
}

@Injectable()
export class SenderNetService implements IMailProvider {
  private readonly logger = new Logger(SenderNetService.name);
  private readonly config: MailProviderConfig;
  private readonly apiBaseUrl = 'https://api.sender.net/v2';
  private readonly http: AxiosInstance;

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
  private async createOrGetGroup(title: string): Promise<string> {
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
        // Fetch groups and return the existing one
        const groupsResp =
          await this.http.get<SenderNetResponse<SenderNetGroup[]>>('/groups');
        const found = groupsResp.data.data.find((g) => g.title === title);
        if (!found)
          throw new Error(`Group "${title}" exists but not retrievable`);
        return found.id;
      }
      throw err;
    }
  }

  // -----------------------------
  // Subscribers
  // -----------------------------
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
        const subsResp = await this.http.get<
          SenderNetResponse<SenderNetSubscriber[]>
        >('/subscribers', { params: { email } });
        const found = subsResp.data.data.find(
          (s) => s.email.toLowerCase() === email.toLowerCase(),
        );
        if (!found)
          throw new Error(`Subscriber ${email} exists but not retrievable`);

        // Ensure they are in the group
        await this.http.patch(`/subscribers/${found.id}`, {
          groups: [groupId],
        });

        return found.id;
      }
      throw err;
    }
  }

  // -----------------------------
  // Main Send Flow
  // -----------------------------
  async sendCampaign(options: SendCampaignOptions): Promise<SendResult> {
    const { campaign, recipients } = options;
    const results: SendResult[] = [];

    for (const recipient of recipients) {
      try {
        // Step 1: Group
        const groupTitle = `Campaign-${campaign.id}-${recipient.email}`;
        const groupId = await this.createOrGetGroup(groupTitle);

        // Step 2: Subscriber
        const [firstname, ...rest] = recipient.name?.split(' ') || [''];
        const lastname = rest.join(' ');
        const subscriberId = await this.createOrUpdateSubscriber(
          recipient.email,
          firstname,
          lastname,
          groupId,
        );

        // Step 3: Campaign
        const campaignResp = await this.http.post<
          SenderNetResponse<SenderNetCampaign>
        >('/campaigns', {
          title: `${campaign.name} - ${recipient.email}`,
          subject: recipient.subject || 'Your Campaign',
          from: recipient.fromName || this.config.senderName,
          reply_to: recipient.fromEmail || this.config.senderEmail,
          preheader: recipient.preheader || '',
          content_type: 'html',
          content: recipient.html || '<p>No Content</p>',
          groups: [groupId],
        });

        if (!campaignResp.data.success) {
          throw new Error(
            `Campaign creation failed: ${JSON.stringify(campaignResp.data.message)}`,
          );
        }

        const senderCampaignId = campaignResp.data.data.id;
        this.logger.debug('Created campaign', campaignResp.data);

        // Step 4: Send campaign
        const sendResp = await this.http.post(
          `/campaigns/${senderCampaignId}/send`,
        );
        this.logger.debug('SendResp', sendResp.data);

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
