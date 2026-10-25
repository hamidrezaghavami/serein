import { Router } from "express";
import type { Database } from "../config/database.js";
export function healthRoutes(db: Database) {
  const router = Router();
  router.get("/health", (_req, res) => { res.json({ data: { status: "ok", service: "serein-api" } }); });
  router.get("/ready", async (_req, res) => {
    try { await db.$queryRaw`SELECT 1`; res.json({ data: { status: "ready" } }); }
    catch { res.status(503).json({ error: { code: "NOT_READY", message: "Database is unavailable.", requestId: res.locals.requestId } }); }
  });
  return router;
}
