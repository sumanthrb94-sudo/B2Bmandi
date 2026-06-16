import { prisma } from "@/lib/db";
import { ok, fail } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
        seller: {
          select: { id: true, name: true, businessName: true, city: true },
        },
      },
    });

    if (!product) {
      return fail("Product not found", 404);
    }

    return ok({ product });
  } catch {
    return fail("Could not load product. Please try again.", 500);
  }
}
