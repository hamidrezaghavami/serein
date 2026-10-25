import type { RequestHandler } from "express";
import type { CartService } from "../services/cart.service.js";
import { userId, localeOf } from "../utils/request.js";
export function cartController(service: CartService) {
  const get: RequestHandler = async (_req, res) => { res.json({ data: await service.get(userId(res), localeOf(res)) }); };
  const setItem: RequestHandler = async (_req, res) => { res.json({ data: await service.setItem(userId(res), res.locals.params.productId, res.locals.body.quantity, localeOf(res)) }); };
  const remove: RequestHandler = async (_req, res) => { res.json({ data: await service.remove(userId(res), res.locals.params.productId, localeOf(res)) }); };
  const clear: RequestHandler = async (_req, res) => { res.json({ data: await service.remove(userId(res), undefined, localeOf(res)) }); };
  return { get, setItem, remove, clear };
}
