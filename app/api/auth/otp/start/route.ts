import { z } from "zod";
import { ok, fail, readJson, getClientIp } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { signEphemeralToken } from "@/lib/auth";
import {
  normalizePhone,
  generateOtpCode,
  hashOtp,
  formatPhoneDisplay,
  otpDevMode,
  OTP_TTL_SECONDS,
} from "@/lib/otp";

export const dynamic = "force-dynamic";

const schema = z.object({ phone: z.string().min(3).max(20) });

// POST /api/auth/otp/start — request an OTP for a mobile number.
// Returns a stateless signed `challenge` carrying a keyed hash of the code.
export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!rateLimit(`otp-start-ip:${ip}`, { limit: 12, windowMs: 60_000 }).allowed) {
    return fail("Too many attempts, please try again shortly.", 429);
  }

  const body = await readJson<unknown>(req);
  if (body === null) return fail("Invalid request body", 400);

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.errors[0]?.message ?? "Invalid input", 400);
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) return fail("Enter a valid 10-digit mobile number", 400);

  // Per-number throttle so one phone can't be spammed with codes.
  if (
    !rateLimit(`otp-start-phone:${phone}`, { limit: 5, windowMs: 5 * 60_000 })
      .allowed
  ) {
    return fail("Too many codes requested. Try again in a few minutes.", 429);
  }

  const code = generateOtpCode();
  const challenge = await signEphemeralToken(
    { p: phone, h: hashOtp(code, phone), t: "otp" },
    OTP_TTL_SECONDS,
  );

  // TODO: deliver `code` via an SMS provider here, then disable demo mode.
  const payload: {
    challenge: string;
    expiresIn: number;
    phoneDisplay: string;
    devCode?: string;
  } = {
    challenge,
    expiresIn: OTP_TTL_SECONDS,
    phoneDisplay: formatPhoneDisplay(phone),
  };
  if (otpDevMode()) payload.devCode = code;

  return ok(payload);
}
