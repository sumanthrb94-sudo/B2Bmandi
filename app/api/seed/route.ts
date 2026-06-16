import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";
import { seedDatabase } from "@/prisma/seed-core";
import { fail } from "@/lib/api";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * One-time database seeding for hosted environments (e.g. Vercel) where you
 * can't run a CLI seed script. Guarded by the SEED_SECRET env var.
 *
 *   curl -X POST "https://your-app.vercel.app/api/seed" -H "x-seed-secret: YOUR_SEED_SECRET"
 *
 * Returns 404 unless SEED_SECRET is configured (so it's invisible by default),
 * and 401 if the provided secret doesn't match.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SEED_SECRET;
  if (!secret) {
    return fail("Not found", 404);
  }
  // Accept the secret only via header — query params leak into proxy/CDN/server logs.
  const provided = req.headers.get("x-seed-secret") ?? "";
  const providedBuf = Buffer.from(provided);
  const secretBuf = Buffer.from(secret);
  // Constant-time comparison; guard equal length first (timingSafeEqual throws otherwise).
  if (
    providedBuf.length !== secretBuf.length ||
    !timingSafeEqual(providedBuf, secretBuf)
  ) {
    return fail("Unauthorized", 401);
  }

  try {
    const summary = await seedDatabase(prisma);
    return NextResponse.json({ ok: true, ...summary });
  } catch {
    return fail("Seed failed", 500);
  }
}
