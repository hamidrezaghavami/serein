import "dotenv/config";
import { createDatabase } from "../src/config/database.js";
import { catalog } from "../src/data/catalog.js";
if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before restocking.");
const db = createDatabase(process.env.DATABASE_URL);
try {
  await db.product.updateMany({ where: { id: { in: catalog.map(product => product.id) } }, data: { stock: 100 } });
  console.info("Reset the five demo formulas to 100 units each. Existing orders were kept.");
} finally { await db.$disconnect(); }
