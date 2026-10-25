import type { RequestHandler } from "express";
import type { AccountService } from "../services/account.service.js";
import { userId } from "../utils/request.js";
export function accountController(service: AccountService) {
  const get: RequestHandler = async (_req, res) => { res.json({ data: await service.get(userId(res)) }); };
  const update: RequestHandler = async (_req, res) => { res.json({ data: await service.update(userId(res), res.locals.body) }); };
  return { get, update };
}
