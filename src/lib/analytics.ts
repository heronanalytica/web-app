export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || "";

// Check if the tracking ID exists to prevent errors in development or testing environments
const isDev = process.env.NEXT_PUBLIC_APP_ENV !== "production";
const isGAEnabled = GA_TRACKING_ID !== "" && !isDev && typeof window !== "undefined";

// Track a page view
export const trackPageView = (url: string) => {
  if (!isGAEnabled) return;
  (window as any).gtag?.("config", GA_TRACKING_ID, {
    page_path: url,
  });
};

// Track a specific event
export const trackEvent = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (!isGAEnabled) return;
  (window as any).gtag?.("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
};
