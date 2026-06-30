export const SITE_NAME = "pdfruk";

export const SITE_TAGLINE =
  "Free Privacy-First Merge, Split & Edit PDF Tools";

export const SITE_DESCRIPTION =
  "Free PDF tools to merge, split, convert, edit, sign, and secure your files in your browser. Privacy-first — no sign-up, no watermarks, and most processing stays on your device.";

export const SITE_FACEBOOK_URL = "https://www.facebook.com/pdfruk";

export const SITE_PHONE = "+923337586021";

export const SITE_WHATSAPP_URL = "https://wa.me/+923337586021";

export const SITE_CONTACT_EMAIL = "sadaquatruk@gmail.com";

export const SITE_URL = "https://www.pdfruk.com";

/** Canonical site URL. Override with NEXT_PUBLIC_SITE_URL when needed. */
export function getSiteUrl(): string {
  const override = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (override) return override.replace(/\/$/, "");
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }
  return SITE_URL;
}
