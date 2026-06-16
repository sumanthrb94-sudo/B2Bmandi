import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail, readJson } from "@/lib/api";

export const dynamic = "force-dynamic";

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
    return fail("Not authenticated", 401);
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: orderItemInclude,
    });

    if (!order || order.buyerId !== session.userId) {
      return fail("Order not found", 404);
    }

    return ok({ order });
  } catch {
    return fail("Could not load order. Please try again.", 500);
  }
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
    return fail("Not authenticated", 401);
  }

  const body = await readJson<unknown>(req);
  if (body === null) {
    return fail("Invalid request body", 400);
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Only cancellation is supported", 400);
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    });
    if (!order || order.buyerId !== session.userId) {
      return fail("Order not found", 404);
    }

    if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
      return fail(
        `Cannot cancel an order that is ${order.status.toLowerCase()}`,
        409,
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
            include: {
              product: { select: { id: true, slug: true, image: true } },
            },
          },
        },
      });
    });

    return ok({ order: updated });
  } catch {
    return fail("Could not cancel order. Please try again.", 500);
  }
}
