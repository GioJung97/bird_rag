import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

function resolveDatabasePath(databaseUrl?: string) {
  if (!databaseUrl) {
    return path.join(process.cwd(), "data", "app.db");
  }

  if (databaseUrl.startsWith("file:")) {
    const filePath = databaseUrl.replace("file:", "");
    return path.resolve(process.cwd(), filePath);
  }

  return path.resolve(process.cwd(), databaseUrl);
}

const databasePath = resolveDatabasePath(process.env.DATABASE_URL);
const databaseDir = path.dirname(databasePath);
fs.mkdirSync(databaseDir, { recursive: true });

const sqlite = new Database(databasePath);

export const db = drizzle(sqlite, { schema });
