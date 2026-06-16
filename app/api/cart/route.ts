import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail, readJson } from "@/lib/api";

export const dynamic = "force-dynamic";

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
    return fail("Not authenticated", 401);
  }

  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: { product: { include: productInclude } },
      orderBy: { createdAt: "desc" },
    });

    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.product.pricePerUnit,
      0,
    );

    return ok({ items, subtotal });
  } catch {
    return fail("Could not load cart. Please try again.", 500);
  }
}

const postSchema = z.object({
  productId: z.string().min(1, "productId is required"),
  quantity: z.coerce.number().int().positive().default(1),
});

// POST — add to cart (upsert; adds to existing quantity). Catalog vertical depends on this shape.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return fail("Not authenticated", 401);
  }

  const body = await readJson<unknown>(req);
  if (body === null) {
    return fail("Invalid request body", 400);
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.errors[0]?.message ?? "Invalid input", 400);
  }

  const { productId, quantity } = parsed.data;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product || !product.isActive) {
      return fail("Product not found", 404);
    }
    if (product.stockQty <= 0) {
      return fail("Out of stock", 409);
    }

    // Clamp the requested quantity to [minOrderQty, stockQty]
    const clamp = (q: number) =>
      Math.min(Math.max(q, product.minOrderQty), product.stockQty);

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: session.userId, productId } },
    });

    let item;
    if (existing) {
      const newQty = Math.min(
        existing.quantity + clamp(quantity),
        product.stockQty,
      );
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

    return ok({ item }, existing ? 200 : 201);
  } catch {
    return fail("Could not update cart. Please try again.", 500);
  }
}
