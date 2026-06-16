import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { ok, fail, readJson, getClientIp } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["BUYER", "SELLER"]),
  businessName: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const limit = rateLimit(`register:${getClientIp(req)}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return fail("Too many attempts, please try again shortly.", 429);
  }

  const body = await readJson<unknown>(req);
  if (body === null) {
    return fail("Invalid request body", 400);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.errors[0]?.message ?? "Invalid input", 400);
  }

  const { name, email, password, role, businessName, phone, city } =
    parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return fail("An account with this email already exists", 409);
    }

    const password_hash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: password_hash,
        role,
        businessName: businessName || null,
        phone: phone || null,
        city: city || null,
      },
    });

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const { password: _omit, ...safe } = user;
    return ok({ user: safe }, 201);
  } catch {
    return fail("Something went wrong. Please try again.", 500);
  }
}
