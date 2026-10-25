import { z } from "zod";
export const localeQuery = z.object({ locale: z.enum(["en", "fa"]).default("en") });
export const productParams = z.object({ productId: z.string().regex(/^0[1-5]$/) });
export const productSlugParams = z.object({ slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/) });