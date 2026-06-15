import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";
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

// GET — list the current seller's products
export async function GET() {
  const session = await getSession();
  const denied = ensureSeller(session);
  if (denied) return denied;

  const products = await prisma.product.findMany({
    where: { sellerId: session!.userId },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      _count: { select: { orderItems: true } },
    },
  });

  return NextResponse.json({ products });
}

const createSchema = z.object({
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

// POST — create a product owned by the seller
export async function POST(req: Request) {
  const session = await getSession();
  const denied = ensureSeller(session);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Validate the category exists
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 400 });
  }

  const slug = `${slugify(data.name)}-${Math.random().toString(36).slice(2, 6)}`;

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      image: data.image && data.image !== "" ? data.image : DEFAULT_IMAGE,
      categoryId: data.categoryId,
      unit: data.unit,
      pricePerUnit: data.pricePerUnit,
      minOrderQty: data.minOrderQty,
      stockQty: data.stockQty,
      origin: data.origin && data.origin !== "" ? data.origin : null,
      isActive: data.isActive ?? true,
      sellerId: session!.userId,
    },
    include: { category: true },
  });

  return NextResponse.json({ product }, { status: 201 });
}
