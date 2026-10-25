import type { Database } from "../config/database.js";
import type { NewsletterInput } from "../schemas/newsletter.schema.js";
export class NewsletterService {
  constructor(private db: Database) {}
  async subscribe(input: NewsletterInput) {
    await this.db.newsletterSubscriber.upsert({ where: { email: input.email },
      create: { email: input.email, locale: input.locale }, update: {} });
    // Always return the same message. This endpoint does not send email.
    return { message: "Subscription request received.", emailDeliveryEnabled: false };
  }
}
