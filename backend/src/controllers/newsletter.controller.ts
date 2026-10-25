import type { RequestHandler } from "express";
import type { NewsletterService } from "../services/newsletter.service.js";
export function newsletterController(service: NewsletterService): RequestHandler {
  return async (_req, res) => { res.status(202).json({ data: await service.subscribe(res.locals.body) }); };
}