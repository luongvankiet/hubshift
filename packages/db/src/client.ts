import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { cleanEnv, str } from "envalid";

dotenv.config();

cleanEnv(process.env, {
  DATABASE_URL: str(),
});

export const client = new MongoClient(process.env.DATABASE_URL!);
export const db = client.db();
