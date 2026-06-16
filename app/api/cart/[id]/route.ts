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
    return fail("Not authenticated", 401);
  }

  const body = await readJson<unknown>(req);
  if (body === null) {
    return fail("Invalid request body", 400);
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.errors[0]?.message ?? "Invalid input", 400);
  }

  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
      include: { product: true },
    });
    if (!cartItem) {
      return fail("Cart item not found", 404);
    }
    if (cartItem.userId !== session.userId) {
      return fail("Forbidden", 403);
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

    return ok({ item });
  } catch {
    return fail("Could not update cart item. Please try again.", 500);
  }
}

// DELETE — remove an owned cart item
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getSession();
  if (!session) {
    return fail("Not authenticated", 401);
  }

  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
    });
    if (!cartItem) {
      return fail("Cart item not found", 404);
    }
    if (cartItem.userId !== session.userId) {
      return fail("Forbidden", 403);
    }

    await prisma.cartItem.delete({ where: { id: cartItem.id } });
    return ok({ ok: true });
  } catch {
    return fail("Could not remove cart item. Please try again.", 500);
  }
}
