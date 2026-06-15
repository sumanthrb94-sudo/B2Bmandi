import { NextResponse } from "next/server";
import { prisma, safeDb } from "@/lib/db";

// This route has no request-time inputs, so Next would otherwise try to
// statically prerender (and hit the DB) at build time. Force dynamic.
export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await safeDb(
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: { where: { isActive: true } } } },
      },
    }),
    [],
  );

  return NextResponse.json({ categories });
}
