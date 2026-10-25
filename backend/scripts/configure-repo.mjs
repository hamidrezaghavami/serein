import { readFile, writeFile, rename, unlink } from "node:fs/promises";
import { createPublicKey } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const publicKey = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkh4zYOmgmm4b8WDBrgUL\nyDVUPXJicJAmZb8Gk1I+Zcp2q6qlKyzseQr7/f0YUsJrEJko4BHfKWIpTgiyoaIk\nfOSXNaRUgWOzKqKldyTM8BEe86Lmb3SsJMZbxVYNnNqXE4iJiK55LGE2ubfEkSXh\ntlsNRXhTfTYQhlYMpuEJJ6UXIXnA8E8itU0121+Jc2kOge6AAEmkeXOLYhNN5hD+\n0j4h/Brok5XtZzPOS/ZOuk2keQGlP1azvgqrJf9zS9Q83y8/684L1mOKZr0iTEz2\nF4K4U/LXs5i1IrLH/qX3Vc2M7qQn2gbW+2F3oTar24ndW5NEsGli2PSROKMsdQ3Y\nAwIDAQAB\n-----END PUBLIC KEY-----";
const issuer = "https://modern-grizzly-6396.clerk.accounts.dev";
const backend = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envFile = join(backend, ".env");
const tempFile = join(backend, `.env.clerk-update-${process.pid}`);

function setValue(source, key, value) {
  const pattern = new RegExp(`^[ \t]*(?:export[ \t]+)?${key}[ \t]*=[ \t]*(?:"[^"]*"|'[^']*'|[^\r\n]*)(?:\r?\n|$)`, "gm");
  return source.replace(pattern, "").trimEnd() + "\n" + key + "=" + value + "\n";
}

try {
  const pkg = JSON.parse(await readFile(join(backend, "package.json"), "utf8"));
  if (!pkg.dependencies?.["@clerk/backend"]) throw new Error("Extract this script inside SEREIN's backend/scripts/ folder.");
  const key = createPublicKey(publicKey);
  if (key.asymmetricKeyType !== "rsa") throw new Error("The verification key must be RSA.");
  let source;
  try { source = await readFile(envFile, "utf8"); }
  catch (error) {
    if (error.code === "ENOENT") throw new Error("backend/.env is missing. Create it from .env.example and set your database connection first.");
    throw error;
  }
  source = setValue(source, "CLERK_JWT_KEY", JSON.stringify(publicKey));
  source = setValue(source, "CLERK_ISSUER", issuer);
  await writeFile(tempFile, source, { mode: 0o600, flag: "wx" });
  await rename(tempFile, envFile);
  console.info("Updated CLERK_JWT_KEY and CLERK_ISSUER for SEREIN.");
  console.info("Database and other environment values were preserved. Run pnpm dev next.");
} catch (error) {
  await unlink(tempFile).catch(() => {});
  console.error(error.message);
  process.exitCode = 1;
}