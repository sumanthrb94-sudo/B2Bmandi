import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Lightweight health check for uptime monitors / load balancers.
 * Reports app liveness and database connectivity.
 */
export async function GET() {
  let db = "down";
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = "up";
  } catch {
    db = "down";
  }

  const healthy = db === "up";
  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      db,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
