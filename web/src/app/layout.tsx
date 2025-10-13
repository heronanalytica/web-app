/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @next/next/no-sync-scripts */
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Suspense } from "react"; // Import Suspense
import { ConfigProvider } from "antd";
import "./globals.css";
import ClientLayout from "./clientLayout";
import { AuthProvider } from "@/context/AuthContext";
import ComeBackSoonPage from "./components/ComeBackSoonPage";
import LoadingSession from "./components/LoadingSession";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["100", "400", "500"],
});

export const metadata: Metadata = {
  title: "Heron Analytica",
  description: "Automate every email. Personalize every message",
};

const displayComebackSoon = process.env.NEXT_PUBLIC_OFFLINE === "true";

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
        {/* Set Ant Design primary color globally */}
        <ConfigProvider theme={{ token: { colorPrimary: "#7a6def" } }}>
          <Suspense fallback={<LoadingSession />}>
            {displayComebackSoon ? (
              <ComeBackSoonPage />
            ) : (
              <AuthProvider>
                <ClientLayout>{children}</ClientLayout>
              </AuthProvider>
            )}
          </Suspense>
        </ConfigProvider>
      </body>
    </html>
  );
}
