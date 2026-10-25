import type { RequestHandler } from "express";
import type { OrdersService } from "../services/orders.service.js";
import { idempotencyKeySchema } from "../schemas/orders.schema.js";
import { AppError } from "../utils/app-error.js";
import { userId, localeOf } from "../utils/request.js";
export function ordersController(service: OrdersService) {
  const create: RequestHandler = async (req, res) => {
    const parsed = idempotencyKeySchema.safeParse(req.get("Idempotency-Key"));
    if (!parsed.success) throw new AppError(400, "INVALID_IDEMPOTENCY_KEY", "Send a UUID in the Idempotency-Key header.");
    const key = parsed.data;
    const result = await service.create(userId(res), key, res.locals.body, localeOf(res));
    res.status(result.replayed ? 200 : 201).json({ data: result.order, meta: { replayed: result.replayed } });
  };
  const list: RequestHandler = async (_req, res) => { res.json(await service.list(userId(res), res.locals.query)); };
  const get: RequestHandler = async (_req, res) => { res.json({ data: await service.get(userId(res), res.locals.params.orderId, localeOf(res)) }); };
  return { create, list, get };
}