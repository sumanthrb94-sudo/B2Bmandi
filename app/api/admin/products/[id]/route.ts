import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { pricePerUnit, stockQty, isActive } = body as {
    pricePerUnit?: unknown;
    stockQty?: unknown;
    isActive?: unknown;
  };

  const data: {
    pricePerUnit?: number;
    stockQty?: number;
    isActive?: boolean;
  } = {};

  if (pricePerUnit !== undefined) {
    if (typeof pricePerUnit !== "number" || pricePerUnit < 0) {
      return NextResponse.json(
        { error: "pricePerUnit must be a number >= 0" },
        { status: 400 },
      );
    }
    data.pricePerUnit = pricePerUnit;
  }

  if (stockQty !== undefined) {
    if (
      typeof stockQty !== "number" ||
      stockQty < 0 ||
      !Number.isInteger(stockQty)
    ) {
      return NextResponse.json(
        { error: "stockQty must be an integer >= 0" },
        { status: 400 },
      );
    }
    data.stockQty = stockQty;
  }

  if (isActive !== undefined) {
    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 },
      );
    }
    data.isActive = isActive;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  try {
    const product = await prisma.product.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json(
      { error: "Could not update product." },
      { status: 500 },
    );
  }
}
