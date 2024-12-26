import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientLayout from "./clientLayout";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Heron Analytica",
  description: "Unlock Targeted Marketing, Personalize Customer Experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV;

  return (
    <html lang="en">
      <head>
        {APP_ENV === "production" && (
          <>
            {/* Google Analytics Scripts */}
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={`${roboto.variable}`}>
        {/* Render the client-side layout */}
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
