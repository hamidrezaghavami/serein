import { createHash } from "node:crypto";
import type { Database } from "../config/database.js";
import type { Prisma } from "../generated/prisma/client.js";
import type { OrderInput, OrderListInput } from "../schemas/orders.schema.js";
import type { Locale } from "../utils/request.js";
import { withCartLock } from "../utils/cart-transaction.js";
import { AppError } from "../utils/app-error.js";

type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;
function dto(order: OrderWithItems, locale: Locale) {
  return { id: order.id, status: order.status, demo: true, currency: order.currency,
    totalCents: order.totalCents, total: order.totalCents / 100, createdAt: order.createdAt,
    shipping: { name: order.shippingName, email: order.shippingEmail, address: order.shippingAddress },
    items: order.items.map(item => ({ productId: item.productId, name: locale === "fa" ? item.productNameFa : item.productName,
      image: item.image, quantity: item.quantity, unitPriceCents: item.unitPriceCents,
      lineTotalCents: item.unitPriceCents * item.quantity })) };
}
export class OrdersService {
  constructor(private db: Database) {}
  async create(id: string, key: string, input: OrderInput, locale: Locale) {
    const requestHash = createHash("sha256").update(JSON.stringify(input)).digest("hex");
    return withCartLock(this.db, id, async tx => {
      const existing = await tx.order.findUnique({ where: { userId_idempotencyKey: { userId: id, idempotencyKey: key } }, include: { items: true } });
      if (existing) {
        if (existing.requestHash !== requestHash) throw new AppError(409, "IDEMPOTENCY_CONFLICT", "Use a new idempotency key for a different order request.");
        return { order: dto(existing, locale), replayed: true };
      }
      const cart = await tx.cartItem.findMany({ where: { userId: id }, include: { product: true }, orderBy: { productId: "asc" } });
      if (!cart.length) throw new AppError(409, "EMPTY_CART", "Add a formula to your bag first.");
      for (const item of cart) {
        // The condition and decrement run in one SQL UPDATE; stock cannot go negative.
        const result = await tx.product.updateMany({ where: { id: item.productId, active: true, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
        if (result.count !== 1) throw new AppError(409, "OUT_OF_STOCK", "A formula in your bag is no longer available in this quantity.");
      }
      const totalCents = cart.reduce((sum, item) => sum + item.quantity * item.product.priceCents, 0);
      const order = await tx.order.create({ data: { userId: id, idempotencyKey: key, requestHash, totalCents,
        shippingName: input.shipping.name, shippingEmail: input.shipping.email, shippingAddress: input.shipping.address,
        items: { create: cart.map(item => ({ productId: item.productId, productName: item.product.name,
          productNameFa: item.product.nameFa, image: item.product.image, quantity: item.quantity, unitPriceCents: item.product.priceCents })) },
      }, include: { items: true } });
      await tx.cartItem.deleteMany({ where: { userId: id } });
      return { order: dto(order, locale), replayed: false };
    });
  }
  async get(id: string, orderId: string, locale: Locale) {
    const order = await this.db.order.findFirst({ where: { id: orderId, userId: id }, include: { items: true } });
    if (!order) throw new AppError(404, "ORDER_NOT_FOUND", "This order does not exist.");
    return dto(order, locale);
  }
  async list(id: string, input: OrderListInput) {
    const where = { userId: id };
    const [orders, total] = await Promise.all([
      this.db.order.findMany({ where, include: { items: true }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (input.page - 1) * input.limit, take: input.limit }),
      this.db.order.count({ where }),
    ]);
    return { data: orders.map(order => dto(order, input.locale)), meta: { page: input.page, limit: input.limit, total } };
  }
}
