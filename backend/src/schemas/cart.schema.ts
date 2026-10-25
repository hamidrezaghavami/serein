import { z } from "zod";
export const cartItemSchema = z.object({ quantity: z.number().int().min(1).max(20) }).strict();
export type CartItemInput = z.infer<typeof cartItemSchema>;
