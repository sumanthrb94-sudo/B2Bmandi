import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
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

/**
 * Order placement for the unified B2B order screen. Requires a logged-in user;
 * the order is recorded under their account. Validates stock in a transaction.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please log in to place an order." }, { status: 401 });
  }

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
          buyerId: session.userId,
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
