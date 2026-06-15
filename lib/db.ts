import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient across hot-reloads in dev to avoid exhausting
// database connections.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Run a query but degrade gracefully if the database is unreachable
 * (e.g. a Vercel deploy before a DATABASE_URL is configured). Returns the
 * fallback instead of throwing so public pages can still render.
 */
export async function safeDb<T>(query: Promise<T>, fallback: T): Promise<T> {
  try {
    return await query;
  } catch (err) {
    console.error("[db] query failed, using fallback:", err);
    return fallback;
  }
}

export default prisma;
