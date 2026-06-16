import { z } from "zod";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail, readJson } from "@/lib/api";

export const dynamic = "force-dynamic";

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
    return fail("Not authenticated", 401);
  }
  if (session.role === "BUYER") {
    return fail("Forbidden", 403);
  }

  const body = await readJson<unknown>(req);
  if (body === null) {
    return fail("Invalid request body", 400);
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.errors[0]?.message ?? "Invalid status", 400);
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: { select: { sellerId: true } } },
    });
    if (!order) {
      return fail("Order not found", 404);
    }

    // The order must contain at least one of this seller's items.
    const ownsItem = order.items.some((it) => it.sellerId === session.userId);
    if (!ownsItem) {
      return fail("Forbidden", 403);
    }

    // Cannot touch cancelled orders.
    if (order.status === "CANCELLED") {
      return fail("Cannot change a cancelled order", 409);
    }

    const next = parsed.data.status;
    const currentIdx = FLOW.indexOf(order.status);
    const nextIdx = FLOW.indexOf(next);

    // Must be a strictly forward transition (also disallows reverting to PENDING).
    if (nextIdx <= currentIdx) {
      return fail("Invalid status transition", 409);
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { status: next },
    });

    return ok({ order: updated });
  } catch {
    return fail("Could not update order. Please try again.", 500);
  }
}
