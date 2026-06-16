import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ok, fail } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category")?.trim();
  const sort = searchParams.get("sort")?.trim();
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const rawLimit = Number(searchParams.get("limit"));
  const take =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), 100)
      : 60;
  const rawOffset = Number(searchParams.get("offset"));
  const skip =
    Number.isFinite(rawOffset) && rawOffset > 0 ? Math.floor(rawOffset) : 0;

  const where: Prisma.ProductWhereInput = { isActive: true };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = { is: { slug: category } };
  }

  const min = minPrice != null && minPrice !== "" ? Number(minPrice) : undefined;
  const max = maxPrice != null && maxPrice !== "" ? Number(maxPrice) : undefined;
  if (
    (min !== undefined && !Number.isNaN(min)) ||
    (max !== undefined && !Number.isNaN(max))
  ) {
    where.pricePerUnit = {};
    if (min !== undefined && !Number.isNaN(min)) where.pricePerUnit.gte = min;
    if (max !== undefined && !Number.isNaN(max)) where.pricePerUnit.lte = max;
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput;
  switch (sort) {
    case "price_asc":
      orderBy = { pricePerUnit: "asc" };
      break;
    case "price_desc":
      orderBy = { pricePerUnit: "desc" };
      break;
    case "newest":
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  try {
    const products = await prisma.product.findMany({
      where,
      orderBy,
      take,
      skip,
      include: {
        category: true,
        seller: {
          select: { id: true, name: true, businessName: true, city: true },
        },
      },
    });

    return ok({ products });
  } catch {
    return fail("Could not load products. Please try again.", 500);
  }
}
