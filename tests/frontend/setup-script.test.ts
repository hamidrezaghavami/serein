// @vitest-environment node
import { mkdtemp, mkdir, readFile, writeFile, copyFile, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse } from "dotenv";
import { createPublicKey } from "node:crypto";
import { it, expect } from "vitest";

it("configures SEREIN without exposing a secret or changing the existing database connection", async () => {
  const root = await mkdtemp(join(tmpdir(), "serein-auth-setup-"));
  try {
    await mkdir(join(root, "scripts")); await mkdir(join(root, "backend"));
    // The fixture lives under /tmp; link only this project's installed dotenv for the CLI.
    const { symlink } = await import("node:fs/promises");
    await symlink(fileURLToPath(new URL("../../node_modules", import.meta.url)), join(root, "node_modules"));
    await copyFile(new URL("../../scripts/configure-auth.mjs", import.meta.url), join(root, "scripts/configure-auth.mjs"));
    await writeFile(join(root, "package.json"), JSON.stringify({ dependencies: { next: "16" } }));
    await writeFile(join(root, ".env.local"), 'CLERK_SECRET_KEY="sk_test_abcABC1234567890"\nUNRELATED_SETTING=keep\n');
    const db = 'DATABASE_URL=postgresql://serein_app:fixture_password@127.0.0.1:5432/serein_dev\nPORT=4000\nCLERK_JWT_KEY="old"\nCLERK_ISSUER=https://old.example\n';
    await writeFile(join(root, "backend/.env"), db);
    const log = execFileSync(process.execPath, [join(root, "scripts/configure-auth.mjs")], { encoding: "utf8" });
    expect(log).not.toContain("sk_test_abcABC1234567890");
    const front = parse(await readFile(join(root, ".env.local"), "utf8"));
    const back = parse(await readFile(join(root, "backend/.env"), "utf8"));
    expect(front.CLERK_SECRET_KEY).toBe("sk_test_abcABC1234567890"); expect(front.UNRELATED_SETTING).toBe("keep");
    expect(back.DATABASE_URL).toBe("postgresql://serein_app:fixture_password@127.0.0.1:5432/serein_dev");
    expect(back.PORT).toBe("4000");
    expect(createPublicKey(back.CLERK_JWT_KEY!).asymmetricKeyType).toBe("rsa");
    expect(back.CLERK_ISSUER).toBe("https://modern-grizzly-6396.clerk.accounts.dev");
    execFileSync(process.execPath, [join(root, "scripts/configure-auth.mjs")]);
    expect((await readFile(join(root, ".env.local"), "utf8")).match(/^CLERK_SECRET_KEY=/gm)).toHaveLength(1);
  } finally { await rm(root, { recursive: true, force: true }); }
});
