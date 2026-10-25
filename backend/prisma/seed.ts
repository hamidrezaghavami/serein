import "dotenv/config";
import { createDatabase } from "../src/config/database.js";
import { catalog } from "../src/data/catalog.js";

if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before seeding.");
const db = createDatabase(process.env.DATABASE_URL);
try {
  for (const product of catalog) {
    await db.product.upsert({ where: { id: product.id }, create: { ...product }, update: { ...product } });
  }
  // An update intentionally preserves stock and active flags; it never replenishes inventory.
  console.info(`Seeded ${catalog.length} SEREIN formulas.`);
} finally {
  await db.$disconnect();
}
