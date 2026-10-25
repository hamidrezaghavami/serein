import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  esbuild: { jsx: "automatic" },
  test: { environment: "jsdom", include: ["tests/frontend/**/*.test.{ts,tsx}"], setupFiles: ["tests/frontend/setup.ts"], clearMocks: true },
});