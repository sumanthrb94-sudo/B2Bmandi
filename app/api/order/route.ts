import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

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
  paymentMethod: z.string().default("COD"),
  notes: z.string().optional(),
});

const GUEST_EMAIL = "guest@freshkart.local";

/**
 * Guest (login-free) order placement for the unified B2B order screen.
 * Accepts a cart payload + delivery details, validates stock, and creates an
 * order under a shared guest buyer. No authentication required.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please complete all delivery details and add at least one item." },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Load all referenced products.
  const ids = data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, isActive: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  // Validate + compute lines.
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
      return NextResponse.json(
        { error: "One of the items is no longer available." },
        { status: 409 },
      );
    }
    if (item.quantity > product.stockQty) {
      return NextResponse.json(
        { error: `Only ${product.stockQty} ${product.unit} of ${product.name} left.` },
        { status: 409 },
      );
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

  try {
    const order = await prisma.$transaction(async (tx) => {
      // shared guest buyer (create on first use)
      const guest = await tx.user.upsert({
        where: { email: GUEST_EMAIL },
        update: {},
        create: {
          email: GUEST_EMAIL,
          password: "-", // unusable; guest never logs in
          name: "Guest Buyer",
          role: "BUYER",
          businessName: "Guest B2B",
        },
      });

      const created = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          status: "PENDING",
          totalAmount: total,
          paymentMethod: data.paymentMethod,
          deliveryName: data.deliveryName,
          deliveryPhone: data.deliveryPhone,
          deliveryAddress: data.deliveryAddress,
          deliveryCity: data.deliveryCity,
          deliveryPincode: data.deliveryPincode,
          notes: data.notes,
          buyerId: guest.id,
          items: { create: lines },
        },
      });

      // decrement stock
      for (const line of lines) {
        await tx.product.update({
          where: { id: line.productId },
          data: { stockQty: { decrement: line.quantity } },
        });
      }

      return created;
    });

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not place order. Please try again." },
      { status: 500 },
    );
  }
}
