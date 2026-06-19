import { z } from "zod";
import { prisma } from "@/lib/db";
import { ok, fail, readJson, getClientIp } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import {
  createSession,
  signEphemeralToken,
  verifyEphemeralToken,
} from "@/lib/auth";
import {
  hashOtp,
  safeEqual,
  phoneToEmail,
  VERIFIED_TTL_SECONDS,
} from "@/lib/otp";

export const dynamic = "force-dynamic";

const schema = z.object({
  challenge: z.string().min(10),
  code: z.string().trim().regex(/^\d{4,8}$/, "Enter the 6-digit code"),
});

interface OtpChallenge {
  p: string; // phone
  h: string; // keyed hash of the code
  t: string; // token type
}

// POST /api/auth/otp/verify — check the code.
// Existing phone accounts are logged straight in; new numbers get a short-lived
// `verifiedToken` to carry into profile setup.
export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!rateLimit(`otp-verify-ip:${ip}`, { limit: 20, windowMs: 60_000 }).allowed) {
    return fail("Too many attempts, please try again shortly.", 429);
  }

  const body = await readJson<unknown>(req);
  if (body === null) return fail("Invalid request body", 400);

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.errors[0]?.message ?? "Invalid input", 400);
  }

  const { challenge, code } = parsed.data;
  const payload = await verifyEphemeralToken<OtpChallenge>(challenge);
  if (!payload || payload.t !== "otp" || !payload.p) {
    return fail("Your code expired. Please request a new one.", 400);
  }

  // Slow brute force per number within the challenge window.
  if (
    !rateLimit(`otp-verify-phone:${payload.p}`, { limit: 6, windowMs: 5 * 60_000 })
      .allowed
  ) {
    return fail("Too many tries. Please request a new code.", 429);
  }

  if (!safeEqual(payload.h, hashOtp(code, payload.p))) {
    return fail("That code isn't right. Please try again.", 400);
  }

  const email = phoneToEmail(payload.p);
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Returning phone account → log in immediately.
      await createSession({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });
      const { password: _omit, ...safe } = user;
      return ok({
        status: "logged_in",
        isNewUser: false,
        user: safe,
        redirect: user.role === "ADMIN" ? "/admin" : "/",
      });
    }

    // New number → hand a verified token to the profile step.
    const verifiedToken = await signEphemeralToken(
      { p: payload.p, t: "verified" },
      VERIFIED_TTL_SECONDS,
    );
    return ok({ status: "needs_profile", isNewUser: true, verifiedToken });
  } catch {
    return fail("Something went wrong. Please try again.", 500);
  }
}
