import { getCurrentUser } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return fail("Unauthenticated", 401);
    }
    const { password: _omit, ...safe } = user;
    return ok({ user: safe });
  } catch {
    return fail("Something went wrong. Please try again.", 500);
  }
}
