import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const backend = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(backend, "..");
const packagePath = join(root, "package.json");
const configPath = join(root, "tsconfig.json");
try {
  const pkg = JSON.parse(await readFile(packagePath, "utf8"));
  if (!pkg.dependencies?.next) throw new Error("The parent folder is not the SEREIN Next.js project.");
  const original = await readFile(configPath, "utf8");
  const config = JSON.parse(original);
  config.exclude ??= [];
  if (!Array.isArray(config.exclude)) throw new Error("tsconfig.exclude must be an array.");
  if (config.exclude.includes("backend") || config.exclude.includes("backend/**")) {
    console.info("Backend is already excluded from the frontend TypeScript check.");
  } else {
    const backups = join(backend, ".backups");
    await mkdir(backups, { recursive: true });
    await writeFile(join(backups, "frontend-tsconfig.json"), original);
    config.exclude.push("backend");
    await writeFile(configPath, JSON.stringify(config, null, 2) + "\n");
    console.info("Added backend to the frontend TypeScript exclusion. Original saved in backend/.backups/.");
  }
} catch (error) {
  console.error("Repository setup failed:", error.message);
  console.error("Extract backend/ inside your existing SEREIN project and run this command again.");
  process.exitCode = 1;
}