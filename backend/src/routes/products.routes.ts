import { Router } from "express";
import type { Database } from "../config/database.js";
import { ProductsService } from "../services/products.service.js";
import { productsController } from "../controllers/products.controller.js";
import { validate } from "../middleware/validate.js";
import { localeQuery, productSlugParams } from "../schemas/common.schema.js";
export function productsRoutes(db: Database) {
  const router = Router(); const controller = productsController(new ProductsService(db));
  router.get("/", validate(localeQuery, "query"), controller.list);
  router.get("/:slug", validate(localeQuery, "query"), validate(productSlugParams, "params"), controller.get);
  return router;
}
