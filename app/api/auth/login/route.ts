import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { ok, fail, readJson, getClientIp } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  const limit = rateLimit(`login:${getClientIp(req)}`, {
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

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.errors[0]?.message ?? "Invalid input", 400);
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return fail("Invalid email or password", 401);
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return fail("Invalid email or password", 401);
    }

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const { password: _omit, ...safe } = user;
    return ok({ user: safe });
  } catch {
    return fail("Something went wrong. Please try again.", 500);
  }
}
