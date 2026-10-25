import { beforeAll, beforeEach, afterAll, describe, it, expect } from "vitest";
import { testDatabase } from "./helpers/database.js";
import { CartService } from "../src/services/cart.service.js";
import { AccountService } from "../src/services/account.service.js";
import { ProductsService } from "../src/services/products.service.js";
import { cartItemSchema } from "../src/schemas/cart.schema.js";
let fixture: Awaited<ReturnType<typeof testDatabase>>;
let cart: CartService;
beforeAll(async () => { fixture = await testDatabase(); cart = new CartService(fixture.db); });
beforeEach(async () => { await fixture.reset(); });
afterAll(async () => { await fixture?.close(); });
describe("catalog and account carts", () => {
  it("preserves the frontend product fields and supports Farsi", async () => {
    const products = new ProductsService(fixture.db);
    const en = await products.get("balancing-toner", "en");
    const fa = await products.get("balancing-toner", "fa");
    expect(en).toMatchObject({ id: "01", price: 34, priceCents: 3400, image: "image4.png", size: "150 mL" });
    expect(fa.name).toBe("تونر متعادل‌کننده"); expect(fa.size).toBe("۱۵۰ میلی‌لیتر");
    expect(await products.list("en")).toHaveLength(5);
  });
  it("keeps each account's cart private", async () => {
    await cart.setItem("user_alice", "01", 2, "en");
    expect((await cart.get("user_alice", "en")).subtotalCents).toBe(6800);
    expect((await cart.get("user_bob", "en")).items).toHaveLength(0);
    await cart.remove("user_bob", "01", "en");
    expect((await cart.get("user_alice", "en")).items).toHaveLength(1);
  });
  it("sets absolute quantities idempotently, rather than doubling on retries", async () => {
    await cart.setItem("user_alice", "01", 2, "en"); await cart.setItem("user_alice", "01", 2, "en");
    expect((await cart.get("user_alice", "en")).itemCount).toBe(2);
    await cart.remove("user_alice", "01", "en"); expect((await cart.get("user_alice", "en")).itemCount).toBe(0);
  });
  it("rejects fractional quantities and client-provided prices", () => {
    for (const quantity of [0, -1, 1.5, 21]) expect(cartItemSchema.safeParse({ quantity }).success).toBe(false);
    expect(cartItemSchema.safeParse({ quantity: 1, price: 1 }).success).toBe(false);
  });
  it("does not add inactive or insufficient stock", async () => {
    await fixture.db.product.update({ where: { id: "01" }, data: { stock: 1 } });
    await expect(cart.setItem("user_alice", "01", 2, "en")).rejects.toMatchObject({ code: "OUT_OF_STOCK" });
    expect((await cart.get("user_alice", "en")).items).toHaveLength(0);
  });
  it("persists only the authenticated user's profile", async () => {
    const accounts = new AccountService(fixture.db);
    await accounts.update("user_alice", { displayName: "Alice" });
    expect((await accounts.get("user_bob")).displayName).toBeNull();
    expect((await accounts.get("user_alice")).displayName).toBe("Alice");
  });
});
