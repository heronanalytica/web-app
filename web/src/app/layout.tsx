/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @next/next/no-sync-scripts */
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Suspense } from "react"; // Import Suspense
import "./globals.css";
import ClientLayout from "./clientLayout";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["100", "400", "500"],
});

export const metadata: Metadata = {
  title: "Heron Analytica",
  description: "Unlock AI-Powered Psychographic Segmentation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

  return (
    <html lang="en">
      <head>
        <script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          // @ts-ignore
          strategy="afterInteractive"
        />

        <script
          id="google-analytics"
          // @ts-ignore
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}');
          `}
        </script>
      </head>
      <body className={`${roboto.variable}`}>
        {/* Wrap the client layout in Suspense */}
        <Suspense fallback={<div>Loading...</div>}>
          <ClientLayout>{children}</ClientLayout>
        </Suspense>
      </body>
    </html>
  );
}
