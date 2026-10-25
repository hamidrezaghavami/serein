import { randomUUID } from "node:crypto";
import { beforeAll, beforeEach, afterAll, describe, it, expect } from "vitest";
import { testDatabase } from "./helpers/database.js";
import { testAuth } from "./helpers/auth.js";
import { request } from "./helpers/http.js";
import { createApp } from "../src/app.js";
let database: Awaited<ReturnType<typeof testDatabase>>;
let identity: Awaited<ReturnType<typeof testAuth>>;
let app: ReturnType<typeof createApp>; let token: string;
beforeAll(async () => { database = await testDatabase(); identity = await testAuth(); token = await identity.token(); });
beforeEach(async () => { await database.reset(); app = createApp({ db: database.db, config: identity.config }); });
afterAll(async () => { await database?.close(); });
describe("API routing, validation and response contracts", () => {
  it("serves public bilingual products and readiness", async () => {
    const response = await request(app, "GET", "/api/v1/products?locale=fa");
    expect(response.status).toBe(200); expect(response.body.data[0].name).toBe("تونر متعادل‌کننده");
    expect((await request(app, "GET", "/ready")).status).toBe(200);
  });
  it("returns JSON 401 rather than a redirect for private resources", async () => {
    for (const path of ["account", "cart", "orders"]) {
      const response = await request(app, "GET", `/api/v1/${path}`);
      expect(response.status).toBe(401); expect(response.body.error.code).toBe("UNAUTHENTICATED");
    }
  });
  it("rejects an unapproved origin and an unknown endpoint", async () => {
    expect((await request(app, "GET", "/health", { headers: { origin: "https://unknown.example" } })).status).toBe(403);
    expect((await request(app, "GET", "/missing")).status).toBe(404);
  });
  it("validates cart quantities before writing and completes demo checkout", async () => {
    expect((await request(app, "PUT", "/api/v1/cart/items/01", { token, body: { quantity: 1.5 } })).status).toBe(400);
    const cart = await request(app, "PUT", "/api/v1/cart/items/01", { token, body: { quantity: 2 } });
    expect(cart.status).toBe(200); expect(cart.body.data.subtotalCents).toBe(6800);
    const shipping = { name: "Alex", email: "alex@example.com", address: "123 Example Street" };
    expect((await request(app, "POST", "/api/v1/orders", { token, body: { shipping } })).status).toBe(400);
    const headers = { "idempotency-key": randomUUID() };
    const first = await request(app, "POST", "/api/v1/orders", { token, headers, body: { shipping } });
    expect(first.status).toBe(201); expect(first.body.data.totalCents).toBe(6800);
    const retry = await request(app, "POST", "/api/v1/orders", { token, headers, body: { shipping } });
    expect(retry.status).toBe(200); expect(retry.body.data.id).toBe(first.body.data.id);
  });
  it("requires newsletter consent and accepts duplicate submissions privately", async () => {
    expect((await request(app, "POST", "/api/v1/newsletter", { body: { email: "alex@example.com" } })).status).toBe(400);
    const options = { body: { email: "Alex@example.com", consent: true } };
    const first = await request(app, "POST", "/api/v1/newsletter", options);
    const second = await request(app, "POST", "/api/v1/newsletter", options);
    expect(first.status).toBe(202); expect(first.body).toEqual(second.body);
    expect(await database.db.newsletterSubscriber.count()).toBe(1);
  });
});