import { MailOutlined } from "@ant-design/icons";

export const PROVIDERS = [
  {
    key: "mailchimp",
    name: "MailChimp",
    description:
      "MailChimp is coming soon. You'll be able to connect your MailChimp account to send campaigns from HeronAnalytica.",
    logo: "/images/mailchimp_logo.png",
    homepage: "https://mailchimp.com/",
    icon: <MailOutlined style={{ fontSize: 32, color: "#ffe01b" }} />,
    connectUrl: `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/mail/connect/mailchimp`,
    comingSoon: true,
    headerBg: "linear-gradient(90deg, #ffe01b 0%, #ffe99f 100%)",
  },
  {
    key: "hubspot",
    name: "HubSpot",
    description:
      "HubSpot integration is coming soon. You'll be able to connect your HubSpot account to send campaigns from HeronAnalytica.",
    logo: "/images/hubspot_logo.png",
    homepage: "https://www.hubspot.com/",
    connectUrl: "",
    comingSoon: true,
    headerBg: "linear-gradient(90deg, #ff7a59 0%, #ffb199 100%)",
  },
  {
    key: "klaviyo",
    name: "Klaviyo",
    description:
      "Klaviyo integration is coming soon. You'll be able to connect your Klaviyo account to send campaigns from HeronAnalytica.",
    logo: "/images/klaviyo_logo.png",
    homepage: "https://www.klaviyo.com/",
    connectUrl: "",
    comingSoon: true,
    headerBg: "linear-gradient(90deg, #00c569 0%, #b1ffe7 100%)",
  },
];
