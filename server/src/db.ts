import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { env } from "./env";

export type Db = Database.Database;

function ensureDbDir(dbPath: string) {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export const db: Db = (() => {
  ensureDbDir(env.DATABASE_PATH);
  const database = new Database(env.DATABASE_PATH);
  database.pragma("journal_mode = WAL");
  return database;
})();

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS artworks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      artist_name TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      image_path TEXT,
      digital_file_path TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total_cents INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'paid',
      shipping_name TEXT,
      shipping_address1 TEXT,
      shipping_city TEXT,
      shipping_country TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      artwork_id INTEGER NOT NULL,
      unit_price_cents INTEGER NOT NULL,
      qty INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (artwork_id) REFERENCES artworks(id)
    );

    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
  `);
}
