import { Router } from "express";
import type { Database } from "../config/database.js";
import { OrdersService } from "../services/orders.service.js";
import { ordersController } from "../controllers/orders.controller.js";
import { validate } from "../middleware/validate.js";
import { orderSchema, orderParams, orderListQuery } from "../schemas/orders.schema.js";
import { localeQuery } from "../schemas/common.schema.js";
export function ordersRoutes(db: Database) {
  const router = Router(); const controller = ordersController(new OrdersService(db));
  router.post("/", validate(localeQuery, "query"), validate(orderSchema), controller.create);
  router.get("/", validate(orderListQuery, "query"), controller.list);
  router.get("/:orderId", validate(localeQuery, "query"), validate(orderParams, "params"), controller.get);
  return router;
}
