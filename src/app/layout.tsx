import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "pdfruk — Free Privacy-First PDF Tools",
    template: "%s | pdfruk",
  },
  description:
    "Free PDF tools that run entirely in your browser. Merge, split, convert, and edit PDFs — your files never leave your device.",
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
      </body>
    </html>
  );
}
