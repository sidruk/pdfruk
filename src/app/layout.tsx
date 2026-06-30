import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Inter } from "next/font/google";
import { Suspense } from "react";

import { Ga4PageView } from "@/components/analytics/ga4-page-view";
import { Providers } from "@/components/providers";
import { GA_MEASUREMENT_ID } from "@/lib/analytics/ga4";
import { buildRootMetadata } from "@/lib/seo/metadata";
import { getSiteUrl, SITE_NAME, SITE_TAGLINE } from "@/lib/seo/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  verification: {
    google: "4PZQgN1p1lbDNyy1_AHeGI7uDhJq1oIL0u9o9fg_4s0",
  },
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  ...buildRootMetadata(),
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "32x32" }],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        <Providers>{children}</Providers>
        <Suspense fallback={null}>
          <Ga4PageView />
        </Suspense>
      </body>
      <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
    </html>
  );
}
