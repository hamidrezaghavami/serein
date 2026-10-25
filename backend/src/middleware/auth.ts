import type { RequestHandler } from "express";
import { verifyToken } from "@clerk/backend";
import type { Config } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

export function auth(config: Config): RequestHandler {
  return async (req, res, next) => {
    const match = /^Bearer ([^\s]+)$/i.exec(req.get("Authorization") ?? "");
    if (!match?.[1]) return next(new AppError(401, "UNAUTHENTICATED", "A Clerk session bearer token is required."));
    try {
      const claims = await verifyToken(match[1], { jwtKey: config.clerkJwtKey, authorizedParties: config.allowedOrigins });
      if (claims.iss !== config.clerkIssuer || !claims.sub?.startsWith("user_") ||
          typeof claims.sid !== "string" || !claims.sid.startsWith("sess_") || claims.sts === "pending") {
        throw new Error("Not an active session from this Clerk instance.");
      }
      res.locals.userId = claims.sub;
      next();
    } catch {
      next(new AppError(401, "UNAUTHENTICATED", "The session is invalid or expired. Sign in again."));
    }
  };
}
