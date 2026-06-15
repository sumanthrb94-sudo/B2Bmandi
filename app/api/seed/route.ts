import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { seedDatabase } from "@/prisma/seed-core";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * One-time database seeding for hosted environments (e.g. Vercel) where you
 * can't run a CLI seed script. Guarded by the SEED_SECRET env var.
 *
 *   curl -X POST "https://your-app.vercel.app/api/seed?secret=YOUR_SEED_SECRET"
 *
 * Returns 404 unless SEED_SECRET is configured (so it's invisible by default),
 * and 401 if the provided secret doesn't match.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SEED_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const provided =
    req.nextUrl.searchParams.get("secret") ??
    req.headers.get("x-seed-secret");
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await seedDatabase(prisma);
    return NextResponse.json({ ok: true, ...summary });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Seed failed" },
      { status: 500 },
    );
  }
}
