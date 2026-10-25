import "dotenv/config";
import { createApp } from "./app.js";
import { parseEnv } from "./config/env.js";
import { createDatabase } from "./config/database.js";

const config = parseEnv();
const db = createDatabase(config.databaseUrl);
try {
  await db.$connect();
  const app = createApp({ db, config });
  const server = app.listen(config.port, config.host, () => {
    console.info(`SEREIN API listening on port ${config.port}`);
  });
  server.requestTimeout = 30000;
  server.headersTimeout = 35000;
  let closing = false;
  const shutdown = () => {
    if (closing) return;
    closing = true;
    const timeout = setTimeout(() => process.exit(1), 10000);
    timeout.unref();
    server.close(() => { void db.$disconnect().finally(() => { clearTimeout(timeout); process.exit(0); }); });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
  server.on("error", () => { console.error("API listener failed."); void db.$disconnect().finally(() => process.exit(1)); });
} catch {
  console.error("Database connection failed. Check DATABASE_URL and database availability.");
  await db.$disconnect();
  process.exitCode = 1;
}