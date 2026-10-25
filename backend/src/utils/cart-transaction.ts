import type { Database } from "../config/database.js";
import { Prisma } from "../generated/prisma/client.js";

// Serialize each user's cart writes and checkout, including retries and double-clicks.
export async function withCartLock<T>(db: Database, id: string, work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  await db.user.upsert({ where: { id }, create: { id }, update: {} });
  for (let attempt = 0; ; attempt++) {
    try {
      return await db.$transaction(async tx => {
        await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${id} FOR UPDATE`;
        return work(tx);
      }, { isolationLevel: "Serializable", maxWait: 5000, timeout: 10000 });
    } catch (error) {
      if (attempt < 2 && error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") continue;
      throw error;
    }
  }
}