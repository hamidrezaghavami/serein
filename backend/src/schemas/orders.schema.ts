import { z } from "zod";
export const orderSchema = z.object({ shipping: z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(254).transform(value => value.toLowerCase()),
  address: z.string().trim().min(5).max(500),
}).strict() }).strict();
export const orderListQuery = z.object({
  locale: z.enum(["en", "fa"]).default("en"),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export const orderParams = z.object({ orderId: z.uuid() });
export const idempotencyKeySchema = z.uuid();
export type OrderInput = z.infer<typeof orderSchema>;
export type OrderListInput = z.infer<typeof orderListQuery>;
