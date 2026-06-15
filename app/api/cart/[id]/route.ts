import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const productInclude = {
  category: true,
  seller: {
    select: { id: true, name: true, businessName: true, city: true },
  },
} as const;

const patchSchema = z.object({
  quantity: z.coerce.number().int().positive(),
});

// PATCH — update quantity for an owned cart item (clamped to stock)
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
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: params.id },
    include: { product: true },
  });
  if (!cartItem) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }
  if (cartItem.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { product } = cartItem;
  const clamped = Math.min(
    Math.max(parsed.data.quantity, product.minOrderQty),
    Math.max(product.stockQty, product.minOrderQty),
  );

  const item = await prisma.cartItem.update({
    where: { id: cartItem.id },
    data: { quantity: clamped },
    include: { product: { include: productInclude } },
  });

  return NextResponse.json({ item });
}

// DELETE — remove an owned cart item
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: params.id },
  });
  if (!cartItem) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }
  if (cartItem.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.cartItem.delete({ where: { id: cartItem.id } });
  return NextResponse.json({ ok: true });
}
