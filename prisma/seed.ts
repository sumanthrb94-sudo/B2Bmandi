import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "./seed-core";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding B2B Mandi…");
  const summary = await seedDatabase(prisma);
  console.log(
    `✅ Seeded ${summary.categories} categories, ${summary.sellers} sellers, ${summary.buyers} buyers, ${summary.products} products.`,
  );
  console.log("\n🔐 Demo logins (password: password123):");
  console.log("   Buyer:  buyer@kirana.com");
  console.log("   Seller: ramesh@greenfarms.com");
  console.log("   Admin:  admin@b2bmandi.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
