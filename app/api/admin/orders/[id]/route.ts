import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail, readJson } from "@/lib/api";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PACKED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
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
    return fail("Invalid status", 400);
  }

  try {
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
    });
    return ok({ order });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return fail("Order not found", 404);
    }
    return fail("Could not update order.", 500);
  }
}
