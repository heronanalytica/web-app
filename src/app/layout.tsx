import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import ClientLayout from "./clientLayout"; // Import the client component

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
  return (
    <html lang="en">
      <body className={`${roboto.variable}`}>
        {/* Render the client-side layout */}
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
