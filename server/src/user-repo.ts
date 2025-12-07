import { getDb } from "./db";
import { UserContext } from "./types";

const COLLECTION = "user_contexts";

export async function getUserContext(userId: string): Promise<UserContext | null> {
  const db = await getDb();
  return db.collection<UserContext>(COLLECTION).findOne({ userId });
}

export async function upsertUserContext(context: UserContext) {
  const db = await getDb();
  await db.collection<UserContext>(COLLECTION).updateOne(
    { userId: context.userId },
    { $set: context },
    { upsert: true }
  );
}