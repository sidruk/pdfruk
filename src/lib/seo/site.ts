export const SITE_NAME = "pdfruk";

export const SITE_TAGLINE = "Free Privacy-First PDF Tools";

export const SITE_DESCRIPTION =
  "Free PDF tools that run entirely in your browser. Merge, split, convert, edit, and sign PDFs — your files never leave your device.";

/** Canonical site URL. Set NEXT_PUBLIC_SITE_URL in production (e.g. https://pdfruk.com). */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) return url.replace(/\/$/, "");
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}
