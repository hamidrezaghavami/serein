import type { Database } from "../config/database.js";
import type { AccountInput } from "../schemas/account.schema.js";
export class AccountService {
  constructor(private db: Database) {}
  get(id: string) { return this.db.user.upsert({ where: { id }, create: { id }, update: {} }); }
  async update(id: string, data: AccountInput) {
    return this.db.user.upsert({ where: { id }, create: { id, ...data }, update: data });
  }
}
