import { mkdtemp, mkdir, readFile, writeFile, copyFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { it, expect } from "vitest";

it("isolates the backend from the parent Next.js compiler without replacing other settings", async () => {
  const root = await mkdtemp(join(tmpdir(), "serein-config-test-"));
  try {
    const scripts = join(root, "backend/scripts"); await mkdir(scripts, { recursive: true });
    const file = join(scripts, "configure-repo.mjs");
    await copyFile(new URL("../scripts/configure-repo.mjs", import.meta.url), file);
    const original = { compilerOptions: { strict: true }, include: ["**/*.ts"], exclude: ["node_modules"] };
    await writeFile(join(root, "package.json"), JSON.stringify({ dependencies: { next: "16" } }));
    await writeFile(join(root, "tsconfig.json"), JSON.stringify(original));
    execFileSync(process.execPath, [file]); execFileSync(process.execPath, [file]);
    const result = JSON.parse(await readFile(join(root, "tsconfig.json"), "utf8"));
    expect(result).toEqual({ ...original, exclude: ["node_modules", "backend"] });
    expect(JSON.parse(await readFile(join(root, "backend/.backups/frontend-tsconfig.json"), "utf8"))).toEqual(original);
  } finally { await rm(root, { recursive: true, force: true }); }
});