import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosInstance } from 'axios';
import {
  IMailProvider,
  MailProviderConfig,
  SendCampaignOptions,
  SendResult,
} from '../mail-provider.interface';

interface SenderNetCampaignResponse {
  id: string;
  name: string;
}

interface SenderNetErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

type SenderNetAxiosError = AxiosError<SenderNetErrorResponse>;

@Injectable()
export class SenderNetService implements IMailProvider {
  private readonly logger = new Logger(SenderNetService.name);
  private readonly config: MailProviderConfig;
  private readonly apiBaseUrl = 'https://api.sender.net/v1';
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

  async sendCampaign(options: SendCampaignOptions): Promise<SendResult> {
    const { campaign, recipients } = options;
    const results: SendResult[] = [];

    for (const recipient of recipients) {
      try {
        const response = await this.http.post<SenderNetCampaignResponse>(
          '/campaigns',
          {
            name: `${campaign.name} - ${recipient.email}`,
            subject: recipient.subject || 'Your Campaign',
            from_email: recipient.fromEmail || this.config.senderEmail,
            from_name: recipient.fromName || this.config.senderName,
            content: recipient.html || '<p>No Content</p>',
            preheader: recipient.preheader || '',
          },
        );

        const { id: senderCampaignId } = response.data;

        // Attach single recipient
        await this.http.post(`/campaigns/${senderCampaignId}/recipients`, {
          emails: [recipient.email],
          names: [recipient.name || ''],
        });

        // Send immediately
        await this.http.post(`/campaigns/${senderCampaignId}/send`);

        results.push({
          success: true,
          message: `Sent campaign to ${recipient.email}`,
          data: { campaignId: senderCampaignId },
        });
      } catch (error) {
        results.push({
          success: false,
          message: this.getErrorMessage(error),
          data: this.getErrorData(error),
        });
      }
    }

    // Aggregate result
    return {
      success: results.every((r) => r.success),
      message: `Sent ${results.filter((r) => r.success).length}/${recipients.length} campaigns`,
      data: { results },
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      this.logger.log('Testing Sender.net connection...');
      const response = await this.http.get('/account');
      const isConnected = response.status === 200;

      if (isConnected) {
        this.logger.log('Successfully connected to Sender.net');
      } else {
        this.logger.warn(
          'Unexpected status code when testing Sender.net connection',
          {
            status: response.status,
            statusText: response.statusText,
          },
        );
      }

      return isConnected;
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      this.logger.error('Error testing Sender.net connection', {
        error: errorMessage,
        errorData: this.getErrorData(error),
      });

      return false;
    }
  }

  private getErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof Error) {
      return error.message;
    }

    if (this.isAxiosError(error)) {
      const axiosError = error;
      return (
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Unknown error from Sender.net'
      );
    }

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
