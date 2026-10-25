import { randomUUID } from "node:crypto";
import { beforeAll, beforeEach, afterAll, describe, it, expect } from "vitest";
import { testDatabase } from "./helpers/database.js";
import { CartService } from "../src/services/cart.service.js";
import { OrdersService } from "../src/services/orders.service.js";
import { orderSchema } from "../src/schemas/orders.schema.js";
let fixture: Awaited<ReturnType<typeof testDatabase>>;
let cart: CartService; let orders: OrdersService;
const input = { shipping: { name: "Alex Example", email: "alex@example.com", address: "123 Example Street" } };
beforeAll(async () => { fixture = await testDatabase(); cart = new CartService(fixture.db); orders = new OrdersService(fixture.db); });
beforeEach(async () => { await fixture.reset(); });
afterAll(async () => { await fixture?.close(); });
describe("atomic demo checkout", () => {
  it("calculates totals from the catalog, stores snapshots and clears the cart", async () => {
    await cart.setItem("user_alice", "01", 2, "en"); await cart.setItem("user_alice", "02", 1, "en");
    const result = await orders.create("user_alice", randomUUID(), input, "en");
    expect(result.order).toMatchObject({ totalCents: 11000, total: 110, status: "DEMO_CONFIRMED", demo: true });
    expect((await cart.get("user_alice", "en")).items).toHaveLength(0);
    await fixture.db.product.update({ where: { id: "01" }, data: { priceCents: 9999, name: "Changed" } });
    const saved = await orders.get("user_alice", result.order.id, "en");
    expect(saved.items.find(item => item.productId === "01")).toMatchObject({ name: "Balancing Toner", unitPriceCents: 3400 });
  });
  it("retries the same order once, without taking more stock", async () => {
    await cart.setItem("user_alice", "01", 2, "en"); const key = randomUUID();
    const first = await orders.create("user_alice", key, input, "en");
    const second = await orders.create("user_alice", key, input, "en");
    expect(second.order.id).toBe(first.order.id); expect(second.replayed).toBe(true);
    expect(await fixture.db.order.count()).toBe(1);
    expect((await fixture.db.product.findUniqueOrThrow({ where: { id: "01" } })).stock).toBe(98);
  });
  it("deduplicates concurrent double-clicks with the same key", async () => {
    await cart.setItem("user_alice", "01", 1, "en"); const key = randomUUID();
    const results = await Promise.all([
      orders.create("user_alice", key, input, "en"), orders.create("user_alice", key, input, "en"),
    ]);
    expect(new Set(results.map(result => result.order.id)).size).toBe(1);
    expect(await fixture.db.order.count()).toBe(1);
    expect((await fixture.db.product.findUniqueOrThrow({ where: { id: "01" } })).stock).toBe(99);
  });
  it("rejects the same key used for a different request", async () => {
    await cart.setItem("user_alice", "01", 1, "en"); const key = randomUUID();
    await orders.create("user_alice", key, input, "en");
    await expect(orders.create("user_alice", key, { shipping: { ...input.shipping, name: "Changed" } }, "en")).rejects.toMatchObject({ code: "IDEMPOTENCY_CONFLICT" });
  });
  it("rolls back earlier stock changes if a later formula is unavailable", async () => {
    await cart.setItem("user_alice", "01", 2, "en"); await cart.setItem("user_alice", "02", 2, "en");
    await fixture.db.product.update({ where: { id: "02" }, data: { stock: 0 } });
    await expect(orders.create("user_alice", randomUUID(), input, "en")).rejects.toMatchObject({ code: "OUT_OF_STOCK" });
    expect((await fixture.db.product.findUniqueOrThrow({ where: { id: "01" } })).stock).toBe(100);
    expect(await fixture.db.order.count()).toBe(0); expect((await cart.get("user_alice", "en")).items).toHaveLength(2);
  });
  it("does not oversell stock to two shoppers", async () => {
    await fixture.db.product.update({ where: { id: "01" }, data: { stock: 1 } });
    await cart.setItem("user_alice", "01", 1, "en"); await cart.setItem("user_bob", "01", 1, "en");
    const results = await Promise.allSettled([
      orders.create("user_alice", randomUUID(), input, "en"), orders.create("user_bob", randomUUID(), input, "en"),
    ]);
    expect(results.filter(result => result.status === "fulfilled")).toHaveLength(1);
    expect((await fixture.db.product.findUniqueOrThrow({ where: { id: "01" } })).stock).toBe(0);
  });
  it("does not expose another shopper's order", async () => {
    await cart.setItem("user_alice", "01", 1, "en");
    const result = await orders.create("user_alice", randomUUID(), input, "en");
    await expect(orders.get("user_bob", result.order.id, "en")).rejects.toMatchObject({ status: 404 });
    expect((await orders.list("user_bob", { locale: "en", page: 1, limit: 20 })).meta.total).toBe(0);
  });
  it("rejects empty carts and request-supplied payment totals", async () => {
    await expect(orders.create("user_alice", randomUUID(), input, "en")).rejects.toMatchObject({ code: "EMPTY_CART" });
    expect(orderSchema.safeParse({ ...input, total: 0 }).success).toBe(false);
  });
});
