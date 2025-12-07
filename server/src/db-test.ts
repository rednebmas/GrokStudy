import { getDb } from "./db";

async function main() {
  const db = await getDb();
  const collections = await db.listCollections().toArray();
  console.log("Connected. Collections:", collections.map(c => c.name));
  const ping = await db.command({ ping: 1 });
  console.log("Ping result:", ping);
  process.exit(0);
}

main().catch(err => {
  console.error("DB test failed", err);
  process.exit(1);
});
