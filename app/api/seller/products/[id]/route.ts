import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { UNITS } from "@/lib/types";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=60";

function ensureSeller(session: Awaited<ReturnType<typeof getSession>>) {
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (session.role === "BUYER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

const updateSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
  image: z.string().trim().url("Image must be a valid URL").optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
  unit: z.enum(UNITS),
  pricePerUnit: z.coerce.number().positive("Price must be greater than 0"),
  minOrderQty: z.coerce.number().int().positive("Minimum order quantity must be at least 1"),
  stockQty: z.coerce.number().int().min(0, "Stock cannot be negative"),
  origin: z.string().trim().optional().or(z.literal("")),
  isActive: z.coerce.boolean().optional().default(true),
});

// PUT — update one of the seller's own products
export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getSession();
  const denied = ensureSeller(session);
  if (denied) return denied;

  const existing = await prisma.product.findUnique({
    where: { id: params.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (existing.sellerId !== session!.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      name: data.name,
      description: data.description,
      image: data.image && data.image !== "" ? data.image : DEFAULT_IMAGE,
      categoryId: data.categoryId,
      unit: data.unit,
      pricePerUnit: data.pricePerUnit,
      minOrderQty: data.minOrderQty,
      stockQty: data.stockQty,
      origin: data.origin && data.origin !== "" ? data.origin : null,
      isActive: data.isActive ?? true,
    },
    include: { category: true },
  });

  return NextResponse.json({ product });
}

// DELETE — delete the seller's own product (soft-deactivate if it has order items)
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getSession();
  const denied = ensureSeller(session);
  if (denied) return denied;

  const existing = await prisma.product.findUnique({
    where: { id: params.id },
    include: { _count: { select: { orderItems: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (existing.sellerId !== session!.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (existing._count.orderItems > 0) {
    await prisma.product.update({
      where: { id: params.id },
      data: { isActive: false },
    });
    return NextResponse.json({ ok: true, softDeleted: true });
  }

  // Remove any cart references first to avoid FK issues, then hard delete.
  await prisma.cartItem.deleteMany({ where: { productId: params.id } });
  await prisma.product.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true, softDeleted: false });
}
