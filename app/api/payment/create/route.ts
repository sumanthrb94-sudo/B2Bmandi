import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { ok, fail, readJson } from "@/lib/api";
import {
  razorpayConfigured,
  createRazorpayOrder,
  publicKeyId,
} from "@/lib/razorpay";

export const dynamic = "force-dynamic";

// Same body shape as /api/order.
const schema = z.object({
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
  paymentMethod: z.string().default("ONLINE"),
  notes: z.string().optional(),
});

/**
 * Begin an online payment. Computes the amount server-side (never trusting the
 * client). When Razorpay is configured we create a Razorpay order and return
 * the details the browser checkout needs — the local Order is NOT created here,
 * only after the signature is verified in /api/payment/verify. When Razorpay is
 * not configured we tell the client to use the existing mock flow + /api/order.
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
    return fail(
      "Please complete all delivery details and add at least one item.",
      400,
    );
  }
  const data = parsed.data;

  // If Razorpay isn't set up, fall back to the mock gateway client-side.
  if (!razorpayConfigured()) {
    return ok({ configured: false });
  }

  try {
    // Server-authoritative amount: compute total from DB products.
    const ids = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: ids }, isActive: true },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    let total = 0;
    for (const item of data.items) {
      const product = byId.get(item.productId);
      if (!product) {
        return fail("One of the items is no longer available.", 409);
      }
      total += product.pricePerUnit * item.quantity;
    }

    const amountPaise = Math.round(total * 100);
    const receipt = generateOrderNumber();
    const rzpOrder = await createRazorpayOrder(amountPaise, receipt);

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true, phone: true, name: true },
    });

    return ok({
      configured: true,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: "INR",
      keyId: publicKeyId(),
      name: "FreshKart",
      description: "B2B produce order",
      prefill: {
        name: data.deliveryName || user?.name || session.name,
        email: user?.email || session.email,
        contact: data.deliveryPhone || user?.phone || "",
      },
      items: data.items,
      delivery: {
        deliveryName: data.deliveryName,
        deliveryPhone: data.deliveryPhone,
        deliveryAddress: data.deliveryAddress,
        deliveryCity: data.deliveryCity,
        deliveryPincode: data.deliveryPincode,
      },
    });
  } catch {
    return fail("Could not start payment. Please try again.", 500);
  }
}
