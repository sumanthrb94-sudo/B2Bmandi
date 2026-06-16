import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { ok, fail, readJson } from "@/lib/api";

export const dynamic = "force-dynamic";

const orderItemInclude = {
  items: { include: { product: { select: { id: true, slug: true, image: true } } } },
} as const;

// GET — current user's orders (as buyer), newest-first, with items
export async function GET() {
  const session = await getSession();
  if (!session) {
    return fail("Not authenticated", 401);
  }

  try {
    const orders = await prisma.order.findMany({
      where: { buyerId: session.userId },
      include: orderItemInclude,
      orderBy: { createdAt: "desc" },
    });

    return ok({ orders });
  } catch {
    return fail("Could not load orders. Please try again.", 500);
  }
}

const postSchema = z.object({
  deliveryName: z.string().trim().min(1, "Delivery name is required"),
  deliveryPhone: z.string().trim().min(1, "Phone is required"),
  deliveryAddress: z.string().trim().min(1, "Address is required"),
  deliveryCity: z.string().trim().min(1, "City is required"),
  deliveryPincode: z.string().trim().min(1, "Pincode is required"),
  paymentMethod: z.enum(["COD", "CREDIT", "ONLINE"]).default("COD"),
  notes: z.string().trim().optional(),
});

// POST — create an order from the current user's cart
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
  const data = parsed.data;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { userId: session.userId },
        include: { product: true },
      });

      if (cartItems.length === 0) {
        throw new OrderError(400, "Your cart is empty");
      }

      // Re-validate stock
      for (const ci of cartItems) {
        if (!ci.product.isActive) {
          throw new OrderError(
            409,
            `${ci.product.name} is no longer available`,
          );
        }
        if (ci.quantity > ci.product.stockQty) {
          throw new OrderError(
            409,
            `Insufficient stock for ${ci.product.name}. Only ${ci.product.stockQty} ${ci.product.unit} left.`,
          );
        }
      }

      const totalAmount = cartItems.reduce(
        (sum, ci) => sum + ci.quantity * ci.product.pricePerUnit,
        0,
      );

      const created = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          status: "PENDING",
          totalAmount,
          paymentMethod: data.paymentMethod,
          deliveryName: data.deliveryName,
          deliveryPhone: data.deliveryPhone,
          deliveryAddress: data.deliveryAddress,
          deliveryCity: data.deliveryCity,
          deliveryPincode: data.deliveryPincode,
          notes: data.notes || null,
          buyerId: session.userId,
          items: {
            create: cartItems.map((ci) => ({
              productName: ci.product.name,
              unit: ci.product.unit,
              unitPrice: ci.product.pricePerUnit,
              quantity: ci.quantity,
              lineTotal: ci.quantity * ci.product.pricePerUnit,
              productId: ci.productId,
              sellerId: ci.product.sellerId,
            })),
          },
        },
        include: orderItemInclude,
      });

      // Decrement stock
      for (const ci of cartItems) {
        await tx.product.update({
          where: { id: ci.productId },
          data: { stockQty: { decrement: ci.quantity } },
        });
      }

      // Clear the cart
      await tx.cartItem.deleteMany({ where: { userId: session.userId } });

      return created;
    });

    return ok({ order }, 201);
  } catch (err) {
    if (err instanceof OrderError) {
      return fail(err.message, err.status);
    }
    return fail("Could not place order. Please try again.", 500);
  }
}

class OrderError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "OrderError";
  }
}
