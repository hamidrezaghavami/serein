import type { Response } from "express";
import { AppError } from "./app-error.js";
export function userId(res: Response): string {
  if (typeof res.locals.userId !== "string") throw new AppError(401, "UNAUTHENTICATED", "Sign in to continue.");
  return res.locals.userId;
}
export type Locale = "en" | "fa";
export const localeOf = (res: Response): Locale => res.locals.query?.locale === "fa" ? "fa" : "en";
