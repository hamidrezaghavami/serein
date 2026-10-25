import { generateKeyPair, exportSPKI, SignJWT } from "jose";
import type { Config } from "../../src/config/env.js";

export async function testAuth() {
  const keys = await generateKeyPair("RS256", { extractable: true });
  const config: Config = {
    nodeEnv: "test", host: "127.0.0.1", port: 4000, databaseUrl: "postgresql://localhost/serein_test",
    allowedOrigins: ["http://localhost:3000"], clerkIssuer: "https://test.clerk.accounts.dev",
    clerkJwtKey: await exportSPKI(keys.publicKey), trustProxyHops: 0,
  };
  async function token(id = "user_alice", overrides: Record<string, unknown> = {}) {
    const now = Math.floor(Date.now() / 1000);
    return new SignJWT({ azp: config.allowedOrigins[0], sid: "sess_test", v: 2,
      iss: config.clerkIssuer, sub: id, iat: now, nbf: now - 1, exp: now + 300, ...overrides })
      .setProtectedHeader({ alg: "RS256", typ: "JWT", kid: "test" })
      .sign(keys.privateKey);
  }
  return { config, token };
}