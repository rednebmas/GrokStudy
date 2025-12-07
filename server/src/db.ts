import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI missing");

const client = new MongoClient(uri);
let ready: Promise<MongoClient>;

export function getDb() {
  if (!ready) ready = client.connect();
  return ready.then(c => c.db()); // uses DB from URI
}
