import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const orderItemInclude = {
  items: { include: { product: { select: { id: true, slug: true, image: true } } } },
} as const;

// GET — single order with items (buyer-owned, else 404)
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: orderItemInclude,
  });

  if (!order || order.buyerId !== session.userId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

const patchSchema = z.object({
  status: z.literal("CANCELLED"),
});

// PATCH — buyer cancellation (only from PENDING/CONFIRMED); restores stock
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
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
      { error: "Only cancellation is supported" },
      { status: 400 },
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!order || order.buyerId !== session.userId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
    return NextResponse.json(
      { error: `Cannot cancel an order that is ${order.status.toLowerCase()}` },
      { status: 400 },
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    // Restore stock for each item
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQty: { increment: item.quantity } },
      });
    }

    return tx.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
      include: {
        items: {
          include: { product: { select: { id: true, slug: true, image: true } } },
        },
      },
    });
  });

  return NextResponse.json({ order: updated });
}
