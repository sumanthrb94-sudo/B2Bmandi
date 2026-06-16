import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { ok, fail, readJson } from "@/lib/api";
import { Prisma } from "@prisma/client";
import { fetchRazorpayOrder, verifyRazorpaySignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

const schema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  deliveryName: z.string().min(1),
  deliveryPhone: z.string().min(5),
  deliveryAddress: z.string().min(1),
  deliveryCity: z.string().min(1),
  deliveryPincode: z.string().min(1),
});

/** Thrown when an item cannot be reserved at the required quantity. */
class OutOfStock extends Error {
  constructor(public productName: string) {
    super(`Insufficient stock for ${productName}`);
    this.name = "OutOfStock";
  }
}

/**
 * Confirm an online payment. Verifies the Razorpay signature, then BINDS the
 * order to the amount actually charged by fetching the Razorpay order and
 * asserting it is `paid` and its amount equals the server-recomputed total
 * (a user who paid ₹35 cannot claim ₹2,500 of goods). Creates the local Order
 * using the same atomic-stock transaction as /api/order. The Razorpay payment
 * id is stored in the unique `razorpayPaymentId` column as a replay guard, so
 * the same payment can mint at most one order. The amount is recomputed
 * server-side, never trusted from the client.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return fail("Please log in to continue.", 401);
  }

  const body = await readJson<unknown>(req);
  if (body === null) {
    return fail("Invalid request body", 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail("Invalid payment confirmation.", 400);
  }
  const data = parsed.data;

  const valid = verifyRazorpaySignature(
    data.razorpay_order_id,
    data.razorpay_payment_id,
    data.razorpay_signature,
  );
  if (!valid) {
    return fail("Payment verification failed.", 400);
  }

  try {
    const ids = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: ids }, isActive: true },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    const lines: {
      productId: string;
      productName: string;
      unit: string;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
      sellerId: string;
    }[] = [];
    let total = 0;
    for (const item of data.items) {
      const product = byId.get(item.productId);
      if (!product) {
        return fail("One of the items is no longer available.", 409);
      }
      const lineTotal = product.pricePerUnit * item.quantity;
      total += lineTotal;
      lines.push({
        productId: product.id,
        productName: product.name,
        unit: product.unit,
        unitPrice: product.pricePerUnit,
        quantity: item.quantity,
        lineTotal,
        sellerId: product.sellerId,
      });
    }

    // Bind the verified payment to the amount actually charged. The Razorpay
    // order must be fully paid and its amount (in paise) must equal the
    // server-recomputed total — otherwise the client is claiming more goods
    // than were paid for.
    const rzpOrder = await fetchRazorpayOrder(data.razorpay_order_id);
    if (
      rzpOrder.status !== "paid" ||
      rzpOrder.amount !== Math.round(total * 100)
    ) {
      return fail("Payment amount mismatch.", 400);
    }

    const order = await prisma.$transaction(async (tx) => {
      for (const line of lines) {
        const res = await tx.product.updateMany({
          where: {
            id: line.productId,
            isActive: true,
            stockQty: { gte: line.quantity },
          },
          data: { stockQty: { decrement: line.quantity } },
        });
        if (res.count !== 1) throw new OutOfStock(line.productName);
      }

      return tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          status: "PENDING",
          totalAmount: total,
          paymentMethod: "ONLINE",
          deliveryName: data.deliveryName,
          deliveryPhone: data.deliveryPhone,
          deliveryAddress: data.deliveryAddress,
          deliveryCity: data.deliveryCity,
          deliveryPincode: data.deliveryPincode,
          notes: "Paid online · rzp " + data.razorpay_payment_id,
          razorpayPaymentId: data.razorpay_payment_id,
          buyerId: session.userId,
          items: { create: lines },
        },
      });
    });

    return ok({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
      },
    });
  } catch (err) {
    if (err instanceof OutOfStock) {
      return fail(`${err.productName} is out of stock.`, 409);
    }
    // Duplicate razorpayPaymentId → this payment was already used for an order.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return fail("This payment has already been processed.", 409);
    }
    return fail("Could not finalize order. Please try again.", 500);
  }
}
