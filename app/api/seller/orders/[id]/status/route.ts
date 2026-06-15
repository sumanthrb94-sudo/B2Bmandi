import { NextResponse } from "next/server";
import { z } from "zod";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Forward-only flow. Index in this array defines ordering.
const FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"];

const patchSchema = z.object({
  status: z.enum(["CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"]),
});

// PATCH — advance the status of an order containing this seller's items
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (session.role === "BUYER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid status" },
      { status: 400 },
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { select: { sellerId: true } } },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // The order must contain at least one of this seller's items.
  const ownsItem = order.items.some((it) => it.sellerId === session.userId);
  if (!ownsItem) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Cannot touch cancelled orders.
  if (order.status === "CANCELLED") {
    return NextResponse.json(
      { error: "Cannot change a cancelled order" },
      { status: 400 },
    );
  }

  const next = parsed.data.status;
  const currentIdx = FLOW.indexOf(order.status);
  const nextIdx = FLOW.indexOf(next);

  // Must be a strictly forward transition (also disallows reverting to PENDING).
  if (nextIdx <= currentIdx) {
    return NextResponse.json(
      { error: "Invalid status transition" },
      { status: 400 },
    );
  }

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: { status: next },
  });

  return NextResponse.json({ order: updated });
}
