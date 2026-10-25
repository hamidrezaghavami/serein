import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../utils/app-error.js";

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (res.headersSent) return _next(error);
  let failure: AppError;
  if (error instanceof AppError) failure = error;
  else if (error instanceof ZodError) failure = new AppError(400, "INVALID_INPUT", "Check the request fields.",
    error.issues.map(issue => ({ path: issue.path.join("."), message: issue.message })));
  else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034")
    failure = new AppError(409, "RETRY_REQUEST", "Another request changed this cart. Please retry.");
  else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
    failure = new AppError(409, "CONFLICT", "This record already exists.");
  else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025")
    failure = new AppError(404, "NOT_FOUND", "The requested record does not exist.");
  else if (typeof error === "object" && error !== null && "type" in error && error.type === "entity.parse.failed")
    failure = new AppError(400, "INVALID_JSON", "The request body must be valid JSON.");
  else if (typeof error === "object" && error !== null && "type" in error && error.type === "entity.too.large")
    failure = new AppError(413, "BODY_TOO_LARGE", "The request body is too large.");
  else {
    failure = new AppError(500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
    console.error(JSON.stringify({ event: "request_failed", requestId: res.locals.requestId, name: error instanceof Error ? error.name : "UnknownError" }));
  }
  res.status(failure.status).json({ error: { code: failure.code, message: failure.message,
    ...(failure.details ? { details: failure.details } : {}), requestId: res.locals.requestId } });
};