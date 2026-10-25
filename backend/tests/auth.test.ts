import { beforeAll, describe, expect, it } from "vitest";
import { createMocks } from "node-mocks-http";
import type { Request, Response } from "express";
import { auth } from "../src/middleware/auth.js";
import { testAuth } from "./helpers/auth.js";
let fixture: Awaited<ReturnType<typeof testAuth>>;
beforeAll(async () => { fixture = await testAuth(); });
async function authenticate(token?: string) {
  const { req, res } = createMocks<Request, Response>({ headers: token ? { authorization: `Bearer ${token}` } : {} });
  let failure: any;
  await auth(fixture.config)(req, res, error => { failure = error; });
  return { failure, id: res.locals.userId };
}
describe("Clerk session verification", () => {
  it("rejects a missing token", async () => { expect((await authenticate()).failure.status).toBe(401); });
  it("accepts a correctly signed session", async () => {
    const result = await authenticate(await fixture.token()); expect(result.failure).toBeUndefined(); expect(result.id).toBe("user_alice");
  });
  it("rejects an expired session", async () => {
    expect((await authenticate(await fixture.token("user_alice", { exp: 1 }))).failure.status).toBe(401);
  });
  it("rejects a token from a different issuer", async () => {
    expect((await authenticate(await fixture.token("user_alice", { iss: "https://other.clerk.accounts.dev" }))).failure.status).toBe(401);
  });
  it("rejects a tampered signature", async () => {
    const token = await fixture.token();
    const pieces = token.split("."); pieces[2] = "invalid";
    expect((await authenticate(pieces.join("."))).failure.status).toBe(401);
  });
  it("rejects an unapproved frontend origin", async () => {
    expect((await authenticate(await fixture.token("user_alice", { azp: "https://attacker.example" }))).failure.status).toBe(401);
  });
  it("rejects a pending session", async () => {
    expect((await authenticate(await fixture.token("user_alice", { sts: "pending" }))).failure.status).toBe(401);
  });
  it("rejects a machine token without a session id", async () => {
    expect((await authenticate(await fixture.token("user_alice", { sid: null }))).failure.status).toBe(401);
  });
});
