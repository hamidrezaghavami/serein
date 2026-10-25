import { readFile, writeFile, rename, unlink } from "node:fs/promises";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicKey } from "node:crypto";
import { Writable } from "node:stream";
import { createInterface } from "node:readline/promises";
import { parse } from "dotenv";

const publicKey = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkh4zYOmgmm4b8WDBrgUL\nyDVUPXJicJAmZb8Gk1I+Zcp2q6qlKyzseQr7/f0YUsJrEJko4BHfKWIpTgiyoaIk\nfOSXNaRUgWOzKqKldyTM8BEe86Lmb3SsJMZbxVYNnNqXE4iJiK55LGE2ubfEkSXh\ntlsNRXhTfTYQhlYMpuEJJ6UXIXnA8E8itU0121+Jc2kOge6AAEmkeXOLYhNN5hD+\n0j4h/Brok5XtZzPOS/ZOuk2keQGlP1azvgqrJf9zS9Q83y8/684L1mOKZr0iTEz2\nF4K4U/LXs5i1IrLH/qX3Vc2M7qQn2gbW+2F3oTar24ndW5NEsGli2PSROKMsdQ3Y\nAwIDAQAB\n-----END PUBLIC KEY-----\n";
const publishableKey = "pk_test_bW9kZXJuLWdyaXp6bHktNjM5Ni5jbGVyay5hY2NvdW50cy5kZXYk";
const issuer = "https://modern-grizzly-6396.clerk.accounts.dev";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function readOptional(path) {
  try { return await readFile(path, "utf8"); }
  catch (error) { if (error.code === "ENOENT") return ""; throw error; }
}

function setValue(source, key, value) {
  const pattern = new RegExp(`^[ \\t]*(?:export[ \\t]+)?${key}[ \\t]*=[ \\t]*(?:"[^"]*"|'[^']*'|[^\\r\\n]*)(?:\\r?\\n|$)`, "gm");
  return source.replace(pattern, "").trimEnd() + "\n" + key + "=" + JSON.stringify(value) + "\n";
}

async function atomicWrite(path, text) {
  const temp = `${path}.auth-update-${process.pid}`;
  try {
    await writeFile(temp, text, { mode: 0o600, flag: "wx" });
    await rename(temp, path);
  } finally { await unlink(temp).catch(() => {}); }
}

async function askSecret() {
  if (!process.stdin.isTTY) throw new Error("Run this command in your interactive Ubuntu terminal to enter your Clerk development secret privately.");
  console.info("In the SEREIN Clerk dashboard, open API keys and use a development Secret key (sk_test_...).");
  console.info("Keep the secret in this local terminal; do not paste it into chat or commit it.");
  process.stdout.write("Paste the SEREIN development secret key (input hidden): ");
  const hiddenOutput = new Writable({ write(_chunk, _encoding, callback) { callback(); } });
  const prompt = createInterface({ input: process.stdin, output: hiddenOutput, terminal: true });
  try { return (await prompt.question("")).trim(); }
  finally { prompt.close(); process.stdout.write("\n"); }
}

try {
  const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  if (!pkg.dependencies?.next) throw new Error("Extract this update in the SEREIN project root; scripts/configure-auth.mjs belongs next to the root package.json.");
  createPublicKey(publicKey);
  const localPath = join(root, ".env.local");
  const existingLocal = await readOptional(localPath);
  const shared = parse(await readOptional(join(root, ".env")));
  const existing = { ...shared, ...parse(existingLocal) };
  if (existing.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && existing.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== publishableKey) {
    throw new Error("A different Clerk application is already configured. No files changed; resolve the application choice first.");
  }
  const backendPath = join(root, "backend/.env");
  let backend = await readOptional(backendPath);
  if (!backend) throw new Error("backend/.env is missing. Keep your working database settings there before running this setup.");
  let secret = existing.CLERK_SECRET_KEY || "";
  if (!/^sk_test_[A-Za-z0-9_-]{12,}$/.test(secret) || /placeholder|replace|example/i.test(secret)) secret = await askSecret();
  if (!/^sk_test_[A-Za-z0-9_-]{12,}$/.test(secret)) throw new Error("Use the development secret key from the SEREIN application (sk_test_...). No settings were written.");
  const api = new URL(existing.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1");
  if (!["http:", "https:"].includes(api.protocol) || api.username || api.password || api.search || api.hash) throw new Error("NEXT_PUBLIC_API_URL must be an HTTP(S) API URL without credentials or query parameters.");
  let frontend = existingLocal;
  const entries = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: publishableKey,
    CLERK_SECRET_KEY: secret,
    CLERK_JWT_KEY: publicKey,
    NEXT_PUBLIC_API_URL: api.href.replace(/\/+$/, ""),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/sign-up",
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: "/account",
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: "/account",
    CLERK_AUTHORIZED_PARTIES: existing.CLERK_AUTHORIZED_PARTIES || "http://localhost:3000,http://localhost:3001",
  };
  for (const [key, value] of Object.entries(entries)) frontend = setValue(frontend, key, value);
  backend = setValue(backend, "CLERK_JWT_KEY", publicKey);
  backend = setValue(backend, "CLERK_ISSUER", issuer);
  await atomicWrite(localPath, frontend);
  await atomicWrite(backendPath, backend);
  console.info("Configured the existing SEREIN Clerk application.");
  console.info("Root .env.local contains the Next.js keys. Backend .env keeps its database/password and has the matching public key.");
  console.info("Start the frontend from the root with pnpm dev, and the API from backend/ with pnpm dev.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}