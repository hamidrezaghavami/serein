import type { Database } from "../config/database.js";
import type { Prisma } from "../generated/prisma/client.js";
import { productDto } from "./products.service.js";
import { withCartLock } from "../utils/cart-transaction.js";
import { AppError } from "../utils/app-error.js";
import type { Locale } from "../utils/request.js";

type Reader = Pick<Prisma.TransactionClient, "cartItem">;
export async function readCart(db: Reader, userId: string, locale: Locale) {
  const rows = await db.cartItem.findMany({ where: { userId }, include: { product: true }, orderBy: { productId: "asc" } });
  const items = rows.map(row => ({ product: productDto(row.product, locale), quantity: row.quantity,
    available: row.product.active && row.product.stock >= row.quantity,
    lineTotalCents: row.product.priceCents * row.quantity }));
  const subtotalCents = items.reduce((sum, item) => sum + item.lineTotalCents, 0);
  return { items, itemCount: items.reduce((sum, item) => sum + item.quantity, 0), subtotalCents, subtotal: subtotalCents / 100, currency: "USD" };
}
export class CartService {
  constructor(private db: Database) {}
  async get(id: string, locale: Locale) { return readCart(this.db, id, locale); }
  async setItem(id: string, productId: string, quantity: number, locale: Locale) {
    return withCartLock(this.db, id, async tx => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product?.active) throw new AppError(404, "PRODUCT_NOT_FOUND", "This formula does not exist.");
      if (product.stock < quantity) throw new AppError(409, "OUT_OF_STOCK", "This quantity is no longer available.");
      await tx.cartItem.upsert({ where: { userId_productId: { userId: id, productId } },
        create: { userId: id, productId, quantity }, update: { quantity } });
      return readCart(tx, id, locale);
    });
  }
  async remove(id: string, productId: string | undefined, locale: Locale) {
    return withCartLock(this.db, id, async tx => {
      await tx.cartItem.deleteMany({ where: { userId: id, ...(productId ? { productId } : {}) } });
      return readCart(tx, id, locale);
    });
  }
}
