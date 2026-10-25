import { z } from "zod";
export const newsletterSchema = z.object({
  email: z.email().max(254).transform(value => value.toLowerCase()),
  locale: z.enum(["en", "fa"]).default("en"),
  consent: z.literal(true),
}).strict();
export type NewsletterInput = z.infer<typeof newsletterSchema>;
