import { Router } from "express";
import type { Database } from "../config/database.js";
import { AccountService } from "../services/account.service.js";
import { accountController } from "../controllers/account.controller.js";
import { validate } from "../middleware/validate.js";
import { accountSchema } from "../schemas/account.schema.js";
export function accountRoutes(db: Database) {
  const router = Router(); const controller = accountController(new AccountService(db));
  router.get("/", controller.get);
  router.patch("/", validate(accountSchema), controller.update);
  return router;
}