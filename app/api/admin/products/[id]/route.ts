import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail, readJson } from "@/lib/api";

export const dynamic = "force-dynamic";

const patchSchema = z
  .object({
    pricePerUnit: z.number().min(0, "pricePerUnit must be a number >= 0"),
    stockQty: z
      .number()
      .int("stockQty must be an integer >= 0")
      .min(0, "stockQty must be an integer >= 0"),
    isActive: z.boolean(),
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, {
    message: "No valid fields to update",
  });

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getSession();
  if (!session) {
    return fail("Unauthenticated", 401);
  }
  if (session.role !== "ADMIN") {
    return fail("Forbidden", 403);
  }

  const body = await readJson<unknown>(req);
  if (body === null) {
    return fail("Invalid request body", 400);
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.errors[0]?.message ?? "Invalid input", 400);
  }

  const data: {
    pricePerUnit?: number;
    stockQty?: number;
    isActive?: boolean;
  } = {};
  if (parsed.data.pricePerUnit !== undefined)
    data.pricePerUnit = parsed.data.pricePerUnit;
  if (parsed.data.stockQty !== undefined) data.stockQty = parsed.data.stockQty;
  if (parsed.data.isActive !== undefined) data.isActive = parsed.data.isActive;

  try {
    const product = await prisma.product.update({
      where: { id: params.id },
      data,
    });
    return ok({ product });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return fail("Product not found", 404);
    }
    return fail("Could not update product.", 500);
  }
}
