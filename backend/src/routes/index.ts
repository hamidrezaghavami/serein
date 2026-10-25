import { Router } from "express";
import type { Database } from "../config/database.js";
import type { Config } from "../config/env.js";
import { auth } from "../middleware/auth.js";
import { productsRoutes } from "./products.routes.js";
import { accountRoutes } from "./account.routes.js";
import { cartRoutes } from "./cart.routes.js";
import { ordersRoutes } from "./orders.routes.js";
import { newsletterRoutes } from "./newsletter.routes.js";
export function apiRoutes(db: Database, config: Config) {
  const router = Router(); const signedIn = auth(config);
  router.use("/products", productsRoutes(db));
  router.use("/newsletter", newsletterRoutes(db));
  router.use("/account", signedIn, accountRoutes(db));
  router.use("/cart", signedIn, cartRoutes(db));
  router.use("/orders", signedIn, ordersRoutes(db));
  return router;
}