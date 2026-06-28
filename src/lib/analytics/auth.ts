import { ADMIN_COOKIE_NAME } from "@/lib/analytics/constants";

export { ADMIN_COOKIE_NAME };

const SESSION_MESSAGE = "pdfruk-admin-session";

function getAdminSecret(): string | undefined {
  return process.env.ADMIN_SECRET;
}

export function isAdminConfigured(): boolean {
  return Boolean(getAdminSecret());
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(message),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function getAdminSessionToken(): Promise<string | null> {
  const secret = getAdminSecret();
  if (!secret) return null;
  return hmacSha256Hex(secret, SESSION_MESSAGE);
}

export function verifyAdminToken(token: string | undefined): boolean {
  const secret = getAdminSecret();
  if (!secret || !token) return false;
  return token === secret;
}

function timingSafeEqualStrings(left: string, right: string): boolean {
  if (left.length !== right.length) return false;

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
}

export async function verifyAdminSession(
  cookieValue: string | undefined,
): Promise<boolean> {
  const expected = await getAdminSessionToken();
  if (!expected || !cookieValue) return false;
  return timingSafeEqualStrings(expected, cookieValue);
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}
