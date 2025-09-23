/**
 * Mail provider configuration registry
 */
export type MailProvider = {
  name: string;
  authUrl?: string; // OAuth only
  tokenUrl?: string; // OAuth only
  clientId?: string; // OAuth only
  clientSecret?: string; // OAuth only
  redirectUri?: string; // OAuth only
  scope?: string; // OAuth only
  icon: string;
  apiKeyOnly?: boolean; // true if provider uses static API key instead of OAuth
};

/**
 * Build redirect URI dynamically based on provider
 * Ensures consistency with backend routes
 */
function buildRedirectUri(provider: string): string {
  const backendUrl = process.env.BACKEND_BASE_URL || 'http://localhost:3000'; // fallback for local dev

  return `${backendUrl}/api/mail/callback/${provider}`;
}

export function getMailProviders(): Record<string, MailProvider> {
  return {
    sendernet: {
      name: 'Sender.net',
      icon: 'sendernet',
      apiKeyOnly: true,
    },
    mailchimp: {
      name: 'MailChimp',
      authUrl: 'https://login.mailchimp.com/oauth2/authorize',
      tokenUrl: 'https://login.mailchimp.com/oauth2/token',
      clientId: process.env.MAILCHIMP_CLIENT_ID,
      clientSecret: process.env.MAILCHIMP_CLIENT_SECRET,
      redirectUri: buildRedirectUri('mailchimp'),
      scope: '', // MailChimp basic access
      icon: 'mailchimp',
    },
    hubspot: {
      name: 'HubSpot',
      authUrl: 'https://app.hubspot.com/oauth/authorize',
      tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
      clientId: process.env.HUBSPOT_CLIENT_ID,
      clientSecret: process.env.HUBSPOT_CLIENT_SECRET,
      redirectUri: buildRedirectUri('hubspot'),
      scope: 'content email automation',
      icon: 'hubspot',
    },
  };
}
