import { Campaign } from 'generated/prisma';

/**
 * Configuration for a mail provider
 */
export interface MailProviderConfig {
  /** API key for the mail service */
  apiKey: string;

  /** Default sender email address */
  senderEmail: string;

  /** Default sender name */
  senderName: string;

  /** Additional provider-specific configuration */
  [key: string]: unknown;
}

/**
 * Options for sending a campaign
 */
export interface Recipient {
  email: string;
  name?: string;
  subject: string;
  html: string;
  preheader?: string;
  fromEmail: string;
  fromName: string;
}
export interface SendCampaignOptions {
  campaign: Campaign;
  recipients: Array<Recipient>;
}

/**
 * Result of a send operation
 */
export interface SendResult {
  /** Whether the operation was successful */
  success: boolean;

  /** Status message */
  message: string;

  /** Additional result data */
  data?: Record<string, unknown>;
}

/**
 * Interface for mail service providers
 */
export interface IMailProvider {
  /**
   * Send a campaign to the specified recipients
   * @param options Send options including campaign and recipients
   * @returns Result of the send operation
   */
  sendCampaign(options: SendCampaignOptions): Promise<SendResult>;

  /**
   * Test the connection to the mail service
   * @returns Whether the connection was successful
   */
  testConnection(): Promise<boolean>;
}
