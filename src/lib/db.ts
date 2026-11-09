import Database from "better-sqlite3";
import path from "node:path";

const dbFile = process.env.DB_PATH ?? path.join(process.cwd(), "polls.db");

// Singleton: Next.js may re-evaluate this module in dev.
const globalForDb = globalThis as unknown as { db?: Database.Database };

export const db =
  globalForDb.db ??
  (() => {
    const d = new Database(dbFile);
    d.pragma("journal_mode = WAL");
    d.pragma("foreign_keys = ON");
    d.exec(`
      CREATE TABLE IF NOT EXISTS polls (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        question   TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS options (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
        label   TEXT NOT NULL,
        votes   INTEGER NOT NULL DEFAULT 0
      );
    `);
    return d;
  })();

if (process.env.NODE_ENV !== "production") globalForDb.db = db;

export type Poll = { id: number; question: string; created_at: string };
export type Option = { id: number; poll_id: number; label: string; votes: number };

export function createPoll(question: string, options: string[]): number {
  const insertPoll = db.prepare("INSERT INTO polls (question) VALUES (?)");
  const insertOption = db.prepare("INSERT INTO options (poll_id, label) VALUES (?, ?)");

  const tx = db.transaction((q: string, opts: string[]) => {
    const info = insertPoll.run(q);
    const pollId = Number(info.lastInsertRowid);
    for (const o of opts) insertOption.run(pollId, o);
    return pollId;
  });
  return tx(question, options);
}

export function listPolls(): Poll[] {
  return db.prepare("SELECT * FROM polls ORDER BY id DESC").all() as Poll[];
}

export function getPoll(id: number): { poll: Poll; options: Option[] } | null {
  const poll = db.prepare("SELECT * FROM polls WHERE id = ?").get(id) as Poll | undefined;
  if (!poll) return null;
  const options = db
    .prepare("SELECT * FROM options WHERE poll_id = ? ORDER BY id")
    .all(id) as Option[];
  return { poll, options };
}

export function voteOnce(optionId: number): boolean {
  const info = db.prepare("UPDATE options SET votes = votes + 1 WHERE id = ?").run(optionId);
  return info.changes === 1;
}
