import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string().regex(/^postgres(ql)?:\/\//, "Use a PostgreSQL connection URL"),
  FRONTEND_ORIGINS: z.string().min(1),
  CLERK_JWT_KEY: z.string().min(1).transform(value => value.replace(/\\n/g, "\n"))
    .refine(value => value.includes("BEGIN PUBLIC KEY") && !value.includes("REPLACE_"), "Set your Clerk JWT public key"),
  CLERK_ISSUER: z.url().transform(value => value.replace(/\/$/, "")),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
});

export function parseEnv(input: Record<string, string | undefined> = process.env) {
  const value = schema.parse(input);
  const allowedOrigins = value.FRONTEND_ORIGINS.split(",").map(origin => origin.trim());
  if (allowedOrigins.some(origin => {
    try { const url = new URL(origin); return url.origin !== origin || !["http:", "https:"].includes(url.protocol); }
    catch { return true; }
  })) throw new Error("FRONTEND_ORIGINS must contain exact HTTP(S) origins without paths or wildcards.");
  return {
    nodeEnv: value.NODE_ENV, port: value.PORT, host: value.HOST, databaseUrl: value.DATABASE_URL,
    allowedOrigins, clerkJwtKey: value.CLERK_JWT_KEY, clerkIssuer: value.CLERK_ISSUER,
    trustProxyHops: value.TRUST_PROXY_HOPS,
  };
}
export type Config = ReturnType<typeof parseEnv>;