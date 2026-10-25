import type { RequestHandler } from "express";
import type { z } from "zod";

export function validate(schema: z.ZodType, location: "body" | "query" | "params" = "body"): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req[location]);
    if (!result.success) return next(result.error);
    res.locals[location] = result.data;
    next();
  };
}