import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { PrismaPGlite } from "pglite-prisma-adapter";
import { PrismaClient } from "../../src/generated/prisma/client.js";
import { catalog } from "../../src/data/catalog.js";

export async function testDatabase() {
  const postgres = new PGlite();
  await postgres.exec(await readFile(new URL("../../prisma/migrations/20261025000000_init/migration.sql", import.meta.url), "utf8"));
  const db = new PrismaClient({ adapter: new PrismaPGlite(postgres) });
  return {
    db,
    async reset() {
      await postgres.exec('TRUNCATE "OrderItem", "Order", "CartItem", "User", "Product", "NewsletterSubscriber" CASCADE');
      await db.product.createMany({ data: catalog.map(item => ({ ...item })) });
    },
    async close() { await db.$disconnect(); await postgres.close(); },
  };
}