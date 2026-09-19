import { DatabaseSync } from "node:sqlite";
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbPath = process.env.SQLITE_DB_PATH
  ? path.resolve(process.cwd(), process.env.SQLITE_DB_PATH)
  : path.resolve(__dirname, "../../data/stepaside.db");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// Uses Node's built-in node:sqlite (stable since Node 22/24) instead of a native npm
// module like better-sqlite3 - no postinstall/compile step at all, so there's nothing
// for an install-scripts policy to block and nothing that can be Node-version/ABI mismatched.
export const db = new DatabaseSync(dbPath);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

// Applies schema.sql on every startup. Safe to run repeatedly - every statement is
// CREATE TABLE IF NOT EXISTS. When this project moves to Postgres for the AWS deployment,
// this file (and the pg-vs-sqlite query calls in the routes) is what changes.
const schemaPath = path.resolve(__dirname, "schema.sql");
db.exec(fs.readFileSync(schemaPath, "utf8"));

// Migration guards: a database created before these columns existed won't have them
// (CREATE TABLE IF NOT EXISTS doesn't retrofit existing tables) - add them if missing.
const bookingColumns = db.prepare("PRAGMA table_info(bookings)").all() as { name: string }[];
if (!bookingColumns.some((col) => col.name === "user_id")) {
  db.exec("ALTER TABLE bookings ADD COLUMN user_id TEXT REFERENCES users(id)");
}

const userColumns = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
if (!userColumns.some((col) => col.name === "name")) {
  db.exec("ALTER TABLE users ADD COLUMN name TEXT NOT NULL DEFAULT ''");
}
