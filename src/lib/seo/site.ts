export const SITE_NAME = "pdfruk";

export const SITE_TAGLINE =
  "Free Privacy-First Merge, Split & Edit PDF Tools";

export const SITE_DESCRIPTION =
  "Free PDF tools to merge, split, convert, edit, sign, and secure your files in your browser. Privacy-first — no sign-up, no watermarks, and most processing stays on your device.";

export const SITE_FACEBOOK_URL = "https://www.facebook.com/pdfruk";

export const SITE_PHONE = "+923337586021";

export const SITE_WHATSAPP_URL = "https://wa.me/+923337586021";

/** Canonical site URL. Set NEXT_PUBLIC_SITE_URL in production (e.g. https://pdfruk.com). */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) return url.replace(/\/$/, "");
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}
