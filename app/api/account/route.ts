import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const patchSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  businessName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  city: z.string().trim().optional(),
  address: z.string().trim().optional(),
  pincode: z.string().trim().optional(),
  gstin: z.string().trim().optional(),
});

// PATCH — update current user's profile fields
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const d = parsed.data;
  const user = await prisma.user.update({
    where: { id: session.userId },
    data: {
      name: d.name,
      businessName: d.businessName || null,
      phone: d.phone || null,
      city: d.city || null,
      address: d.address || null,
      pincode: d.pincode || null,
      gstin: d.gstin || null,
    },
  });

  const { password: _omit, ...safe } = user;
  return NextResponse.json({ user: safe });
}
