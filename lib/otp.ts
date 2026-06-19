import "server-only";
import crypto from "node:crypto";

/**
 * Phone-OTP onboarding helpers.
 *
 * The app's primary identity is still email+password (admin/demo accounts), so
 * phone-first signups are mapped onto a deterministic, reserved synthetic email
 * derived from the phone number. That keeps the unique-email constraint doing
 * the work of "one account per phone" without touching the existing login path.
 *
 * NOTE: no SMS provider is wired up. In demo mode (default) the generated code
 * is returned to the client so the flow is fully usable; swap in a real sender
 * where `start` builds the challenge and turn demo mode off.
 */

const PHONE_EMAIL_DOMAIN = "phone.freshkart.in";

/** Lifetime of an OTP challenge (between requesting and entering the code). */
export const OTP_TTL_SECONDS = 5 * 60;
/** Lifetime of the "this phone is verified" handoff token. */
export const VERIFIED_TTL_SECONDS = 15 * 60;

/**
 * Normalise raw user input to a bare 10-digit Indian mobile number, or null if
 * it isn't a plausible one. Accepts +91 / 0 prefixes and spacing.
 */
export function normalizePhone(raw: string): string | null {
  const digits = (raw || "").replace(/\D/g, "");
  let local = digits;
  if (local.length === 12 && local.startsWith("91")) local = local.slice(2);
  else if (local.length === 11 && local.startsWith("0")) local = local.slice(1);
  if (local.length !== 10) return null;
  if (!/^[6-9]/.test(local)) return null; // Indian mobiles start 6–9
  return local;
}

/** Deterministic reserved email for a phone-first account. */
export function phoneToEmail(localPhone: string): string {
  return `p91${localPhone}@${PHONE_EMAIL_DOMAIN}`;
}

/** "+91 98765 43210" for display. */
export function formatPhoneDisplay(localPhone: string): string {
  return `+91 ${localPhone.slice(0, 5)} ${localPhone.slice(5)}`;
}

/** A zero-padded 6-digit code using a CSPRNG. */
export function generateOtpCode(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

/**
 * Keyed hash of a code, embedded in the (signed) challenge token so we never
 * store the plaintext anywhere and verification stays stateless.
 */
export function hashOtp(code: string, phone: string): string {
  const secret = process.env.AUTH_SECRET || "dev-secret-change-me";
  return crypto
    .createHmac("sha256", secret)
    .update(`${phone}:${code}`)
    .digest("hex");
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/**
 * Whether to surface the generated code to the client. On by default because no
 * SMS provider is configured; set OTP_DEV_MODE="false" once one is.
 */
export function otpDevMode(): boolean {
  return process.env.OTP_DEV_MODE !== "false";
}

export const BUSINESS_TYPES = [
  "Kirana store",
  "Restaurant",
  "Hotel",
  "Cloud kitchen",
  "Reseller",
] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

export interface DeliveryArea {
  id: string;
  label: string;
  city: string;
}

export const DELIVERY_AREAS: DeliveryArea[] = [
  { id: "blr-krmarket", label: "Bengaluru · KR Market", city: "Bengaluru" },
  { id: "blr-yeshwanthpur", label: "Bengaluru · Yeshwanthpur", city: "Bengaluru" },
  { id: "blr-whitefield", label: "Bengaluru · Whitefield", city: "Bengaluru" },
  { id: "che-koyambedu", label: "Chennai · Koyambedu", city: "Chennai" },
  { id: "hyd-bowenpally", label: "Hyderabad · Bowenpally", city: "Hyderabad" },
  { id: "mum-vashi", label: "Mumbai · Vashi APMC", city: "Mumbai" },
];

export function findArea(id: string): DeliveryArea | null {
  return DELIVERY_AREAS.find((a) => a.id === id) ?? null;
}
