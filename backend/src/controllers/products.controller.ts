import type { RequestHandler } from "express";
import type { ProductsService } from "../services/products.service.js";
import { localeOf } from "../utils/request.js";
export function productsController(service: ProductsService) {
  const list: RequestHandler = async (_req, res) => { res.json({ data: await service.list(localeOf(res)), meta: { locale: localeOf(res), currency: "USD" } }); };
  const get: RequestHandler = async (_req, res) => { res.json({ data: await service.get(res.locals.params.slug, localeOf(res)) }); };
  return { list, get };
}