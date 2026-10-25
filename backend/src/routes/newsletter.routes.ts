import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import type { Database } from "../config/database.js";
import { NewsletterService } from "../services/newsletter.service.js";
import { newsletterController } from "../controllers/newsletter.controller.js";
import { validate } from "../middleware/validate.js";
import { newsletterSchema } from "../schemas/newsletter.schema.js";
export function newsletterRoutes(db: Database) {
  const router = Router();
  router.post("/", rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: "draft-8", legacyHeaders: false,
    handler: (_req, res) => { res.status(429).json({ error: { code: "RATE_LIMITED", message: "Please wait before subscribing again.", requestId: res.locals.requestId } }); },
  }), validate(newsletterSchema), newsletterController(new NewsletterService(db)));
  return router;
}