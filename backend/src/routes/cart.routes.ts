import { Router } from "express";
import type { Database } from "../config/database.js";
import { CartService } from "../services/cart.service.js";
import { cartController } from "../controllers/cart.controller.js";
import { validate } from "../middleware/validate.js";
import { cartItemSchema } from "../schemas/cart.schema.js";
import { localeQuery, productParams } from "../schemas/common.schema.js";
export function cartRoutes(db: Database) {
  const router = Router(); const controller = cartController(new CartService(db));
  router.use(validate(localeQuery, "query"));
  router.get("/", controller.get);
  router.put("/items/:productId", validate(productParams, "params"), validate(cartItemSchema), controller.setItem);
  router.delete("/items/:productId", validate(productParams, "params"), controller.remove);
  router.delete("/", controller.clear);
  return router;
}
