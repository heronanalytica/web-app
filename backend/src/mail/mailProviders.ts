export type MailProvider = {
  name: string;
  authUrl: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
  icon: string;
};

export function getMailProviders(): Record<string, MailProvider> {
  return {
    mailchimp: {
      name: 'MailChimp',
      authUrl: 'https://login.mailchimp.com/oauth2/authorize',
      tokenUrl: 'https://login.mailchimp.com/oauth2/token',
      clientId: process.env.MAILCHIMP_CLIENT_ID as string,
      clientSecret: process.env.MAILCHIMP_CLIENT_SECRET as string,
      redirectUri: process.env.MAILCHIMP_REDIRECT_URI as string,
      scope: '', // MailChimp does not require additional scopes for basic access
      icon: 'mailchimp',
    },
    // Add more providers here (e.g. hubspot)
  };
}
