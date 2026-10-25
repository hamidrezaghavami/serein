import { z } from "zod";
export const accountSchema = z.object({
  displayName: z.string().trim().min(1).max(100).nullable().optional(),
  phone: z.string().trim().min(5).max(30).nullable().optional(),
  address: z.string().trim().min(5).max(500).nullable().optional(),
}).strict().refine(value => Object.keys(value).length > 0, "Provide at least one profile field.");
export type AccountInput = z.infer<typeof accountSchema>;
