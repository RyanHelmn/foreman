import fs from "node:fs";
import path from "node:path";
import { importFromMd } from "./export.mjs";
import { writeSafe } from "./util.mjs";

process.removeAllListeners("warning");
process.on("warning", () => {});
const { DatabaseSync } = await import("node:sqlite").catch(() => {
  console.error("foreman memory needs Node >= 22.13 (built-in node:sqlite). Current: " + process.version);
  process.exit(2);
});

const SCHEMA = `
CREATE TABLE IF NOT EXISTS features (
  id INTEGER PRIMARY KEY, title TEXT NOT NULL, summary TEXT DEFAULT '', tags TEXT DEFAULT '', files TEXT DEFAULT '',
  outcome TEXT DEFAULT 'in_progress', iterations INTEGER DEFAULT 0, flipped TEXT DEFAULT '', review TEXT DEFAULT '', security TEXT DEFAULT '',
  started TEXT NOT NULL, finished TEXT
);
CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY, feature_id INTEGER, kind TEXT DEFAULT 'gotcha', text TEXT NOT NULL, paths TEXT DEFAULT '', created TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS decisions (
  id INTEGER PRIMARY KEY, text TEXT NOT NULL, source TEXT DEFAULT 'user', confirmed INTEGER DEFAULT 1, area TEXT DEFAULT '', created TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS backlog (
  id INTEGER PRIMARY KEY, area TEXT NOT NULL, severity TEXT NOT NULL, title TEXT NOT NULL, plan TEXT DEFAULT '', effort TEXT DEFAULT '',
  paths TEXT DEFAULT '', status TEXT DEFAULT 'open', feature_id INTEGER, created TEXT NOT NULL, updated TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS dispatches (
  id INTEGER PRIMARY KEY, feature_id INTEGER NOT NULL, iteration INTEGER NOT NULL, role TEXT NOT NULL, model TEXT NOT NULL,
  unit TEXT DEFAULT '', task_type TEXT DEFAULT 'other', paths TEXT DEFAULT '', started TEXT NOT NULL, finished TEXT,
  duration_s INTEGER, tokens INTEGER, tool_uses INTEGER, outcome TEXT, first_pass INTEGER, notes TEXT DEFAULT ''
);
CREATE TABLE IF NOT EXISTS gate_events (
  id INTEGER PRIMARY KEY, feature_id INTEGER NOT NULL, iteration INTEGER NOT NULL, gate TEXT NOT NULL, result TEXT NOT NULL,
  finding_count INTEGER DEFAULT 0, categories TEXT DEFAULT '', created TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value INTEGER NOT NULL);
CREATE VIRTUAL TABLE IF NOT EXISTS fts USING fts5(kind, ref_id UNINDEXED, title, body, paths, tokenize='trigram');
`;
const ADDED = [["lessons", "source", "TEXT DEFAULT ''"], ["dispatches", "agent_id", "TEXT"], ["dispatches", "source", "TEXT DEFAULT 'lead'"], ["dispatches", "unattributed", "INTEGER DEFAULT 0"]];

export function prepare(db) {
  db.exec(SCHEMA);
  for (const [table, col, def] of ADDED)
    if (!db.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === col)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
  return db;
}

export const memoryDb = () => prepare(new DatabaseSync(":memory:"));

const GITIGNORE = "# managed by foreman: local state only; the .md/.json files beside this are meant to be committed\nmemory.db\nmemory.db-*\nrun.json\n";
export function openDb(dir) {
  writeSafe(path.join(dir, ".gitignore"));
  fs.mkdirSync(dir, { recursive: true });
  const gi = path.join(dir, ".gitignore");
  if (!fs.existsSync(gi)) writeSafe(gi, GITIGNORE);
  const file = path.join(dir, "memory.db");
  const fresh = !fs.existsSync(file);
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode=WAL;");
  prepare(db);
  if (fresh) importFromMd(db, dir);
  return db;
}

export function ftsUpsert(db, kind, refId, title, body, paths) {
  db.prepare("DELETE FROM fts WHERE kind=? AND ref_id=?").run(kind, refId);
  db.prepare("INSERT INTO fts (kind, ref_id, title, body, paths) VALUES (?,?,?,?,?)").run(kind, refId, title ?? "", body ?? "", paths ?? "");
}

export function ftsQuery(q) {
  // trigram tokenizer: substring matches on identifiers; tokens shorter than 3 chars can't match, so drop them
  const toks = q.split(/\s+/).map((t) => t.replace(/"/g, "")).filter((t) => t.length >= 3);
  if (!toks.length) return '"' + q.replace(/"/g, "") + '"';
  return toks.map((t) => '"' + t + '"').join(" OR ");
}
