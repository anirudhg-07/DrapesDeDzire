/**
 * One-time fix: reassign products with fabric="N/A" (Kurta Sets) and
 * jewellery fabric types to the correct categories.
 * Run with: npx tsx scripts/fix-kurta-category.ts
 */
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const url = (process.env.DATABASE_URL || "").replace(/^['"]|['"]$/g, "").trim();
if (!url || url.includes("USER:PASSWORD")) {
  console.error("DATABASE_URL not configured in .env.local");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString: url });
const prisma = new PrismaClient({ adapter });

const JEWELLERY_FABRICS = ["Necklace", "Earrings", "Bangles", "Ring", "Bracelet", "Anklet", "Maang Tikka", "Nose Ring"];

async function main() {
  const kurtaCategory = await prisma.category.upsert({
    where: { slug: "kurta-set" },
    update: {},
    create: {
      name: "Kurta Set",
      slug: "kurta-set",
      description: "Elegant Kurta Sets — comfortable and stylish.",
    },
  });
  console.log("✓ Kurta Set category ready:", kurtaCategory.id);

  const jewelleryCategory = await prisma.category.upsert({
    where: { slug: "jewellery" },
    update: {},
    create: {
      name: "Jewellery",
      slug: "jewellery",
      description: "Exquisite jewellery — the perfect accessory.",
    },
  });
  console.log("✓ Jewellery category ready:", jewelleryCategory.id);

  const kurtaResult = await prisma.product.updateMany({
    where: { fabric: "N/A" },
    data: { categoryId: kurtaCategory.id },
  });
  console.log(`✓ Moved ${kurtaResult.count} Kurta Set product(s) to correct category`);

  const jewelleryResult = await prisma.product.updateMany({
    where: { fabric: { in: JEWELLERY_FABRICS } },
    data: { categoryId: jewelleryCategory.id },
  });
  console.log(`✓ Moved ${jewelleryResult.count} Jewellery product(s) to correct category`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
