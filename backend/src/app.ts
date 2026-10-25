import { randomUUID } from "node:crypto";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import type { Database } from "./config/database.js";
import type { Config } from "./config/env.js";
import { apiRoutes } from "./routes/index.js";
import { healthRoutes } from "./routes/health.routes.js";
import { notFound } from "./middleware/not-found.js";
import { errorHandler } from "./middleware/error-handler.js";
import { AppError } from "./utils/app-error.js";

export function createApp({ db, config }: { db: Database; config: Config }) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", config.trustProxyHops);
  app.use((_req, res, next) => {
    const requestId = randomUUID(); const started = Date.now();
    res.locals.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);
    res.setHeader("Cache-Control", "no-store");
    if (config.nodeEnv !== "test") res.on("finish", () => {
      console.info(JSON.stringify({ requestId, method: _req.method, path: _req.path, status: res.statusCode, durationMs: Date.now() - started }));
    });
    next();
  });
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({
    origin(origin, done) {
      if (!origin || config.allowedOrigins.includes(origin)) done(null, true);
      else done(new AppError(403, "ORIGIN_NOT_ALLOWED", "This origin is not permitted."));
    },
    credentials: false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
    exposedHeaders: ["X-Request-Id"], maxAge: 600,
  }));
  app.use(express.json({ limit: "32kb", strict: true }));
  app.use(healthRoutes(db));
  app.use("/api/v1", rateLimit({ windowMs: 15 * 60 * 1000, limit: 120, standardHeaders: "draft-8", legacyHeaders: false,
    handler: (_req, res) => { res.status(429).json({ error: { code: "RATE_LIMITED", message: "Too many requests. Try again shortly.", requestId: res.locals.requestId } }); },
  }), apiRoutes(db, config));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}