import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

function resolveDatabasePath(databaseUrl) {
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
const db = drizzle(sqlite);

migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });

sqlite.close();
