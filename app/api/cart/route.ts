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

// GET — current user's cart items with relations + subtotal
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: session.userId },
    include: { product: { include: productInclude } },
    orderBy: { createdAt: "desc" },
  });

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.product.pricePerUnit,
    0,
  );

  return NextResponse.json({ items, subtotal });
}

const postSchema = z.object({
  productId: z.string().min(1, "productId is required"),
  quantity: z.coerce.number().int().positive().default(1),
});

// POST — add to cart (upsert; adds to existing quantity). Catalog vertical depends on this shape.
export async function POST(req: Request) {
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

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { productId, quantity } = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (product.stockQty <= 0) {
    return NextResponse.json({ error: "Out of stock" }, { status: 409 });
  }

  // Clamp the requested quantity to [minOrderQty, stockQty]
  const clamp = (q: number) =>
    Math.min(Math.max(q, product.minOrderQty), product.stockQty);

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: session.userId, productId } },
  });

  let item;
  if (existing) {
    const newQty = Math.min(existing.quantity + clamp(quantity), product.stockQty);
    item = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
      include: { product: { include: productInclude } },
    });
  } else {
    item = await prisma.cartItem.create({
      data: {
        userId: session.userId,
        productId,
        quantity: clamp(quantity),
      },
      include: { product: { include: productInclude } },
    });
  }

  return NextResponse.json({ item }, { status: existing ? 200 : 201 });
}
