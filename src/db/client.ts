import { drizzle, SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import Database from "@tauri-apps/plugin-sql";
import * as schema from "./schema";

export let db: SqliteRemoteDatabase<typeof schema>;

// Lazy-loads the database instance, runs optimizations, and initializes tables
export async function initDb() {
  if (db) return;

  const tauriSqlDb = await Database.load("sqlite:heychat.db");

  // 1. Enable foreign keys constraint checks (disabled by default in SQLite)
  await tauriSqlDb.execute("PRAGMA foreign_keys = ON;");

  // 2. Enable WAL mode for high concurrency read/writes
  await tauriSqlDb.execute("PRAGMA journal_mode = WAL;");

  // 3. Set a busy timeout to wait if the database is temporarily locked
  await tauriSqlDb.execute("PRAGMA busy_timeout = 5000;");

  // 4. Initialize Database Tables if they do not exist
  await tauriSqlDb.execute(`
    CREATE TABLE IF NOT EXISTS threads (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
  
  await tauriSqlDb.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  db = drizzle(
    async (sql, params, method) => {
      try {
        if (method === "run") {
          await tauriSqlDb.execute(sql, params);
          return { rows: [] };
        }

        const result = await tauriSqlDb.select<any[]>(sql, params);
        const rows = result.map((row) => Object.values(row));

        if (method === "get") {
          return { rows: rows[0] || [] };
        }

        return { rows };
      } catch (error) {
        console.error("Drizzle SQL Proxy Error:", error);
        throw error;
      }
    },
    { schema }
  );
}

