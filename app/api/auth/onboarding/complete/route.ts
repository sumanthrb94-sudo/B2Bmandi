import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { ok, fail, readJson, getClientIp } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import {
  createSession,
  hashPassword,
  verifyEphemeralToken,
} from "@/lib/auth";
import { phoneToEmail, findArea, BUSINESS_TYPES } from "@/lib/otp";

export const dynamic = "force-dynamic";

const schema = z.object({
  verifiedToken: z.string().min(10),
  shopName: z.string().trim().min(2, "Enter your shop name").max(120),
  businessType: z.enum(BUSINESS_TYPES),
  areaId: z.string().trim().min(1, "Select your delivery area"),
  contactName: z.string().trim().max(80).optional().or(z.literal("")),
});

interface VerifiedToken {
  p: string; // phone
  t: string; // token type
}

// POST /api/auth/onboarding/complete — create the phone account + session.
export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (
    !rateLimit(`onboarding-complete-ip:${ip}`, { limit: 12, windowMs: 60_000 })
      .allowed
  ) {
    return fail("Too many attempts, please try again shortly.", 429);
  }

  const body = await readJson<unknown>(req);
  if (body === null) return fail("Invalid request body", 400);

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.errors[0]?.message ?? "Invalid input", 400);
  }

  const { verifiedToken, shopName, businessType, areaId, contactName } =
    parsed.data;

  const payload = await verifyEphemeralToken<VerifiedToken>(verifiedToken);
  if (!payload || payload.t !== "verified" || !payload.p) {
    return fail("Your session expired. Please verify your number again.", 400);
  }

  const area = findArea(areaId);
  if (!area) return fail("Select a valid delivery area", 400);

  const email = phoneToEmail(payload.p);
  try {
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Phone-first accounts authenticate via OTP, never a password — but the
      // schema requires one, so store a random, unusable hash.
      const randomPassword = await hashPassword(
        crypto.randomUUID() + crypto.randomUUID(),
      );
      user = await prisma.user.create({
        data: {
          email,
          password: randomPassword,
          name: contactName?.trim() || shopName,
          role: "BUYER",
          businessName: shopName,
          businessType,
          phone: payload.p,
          city: area.city,
          address: area.label,
        },
      });
    }

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const { password: _omit, ...safe } = user;
    return ok(
      { user: safe, redirect: user.role === "ADMIN" ? "/admin" : "/" },
      201,
    );
  } catch {
    return fail("Could not finish setup. Please try again.", 500);
  }
}
