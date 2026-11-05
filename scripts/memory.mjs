#!/usr/bin/env node
// foreman memory — a single-file SQLite store (.foreman/memory.db) with full-text search.
// Zero dependencies: uses Node's built-in node:sqlite (Node >= 22.13).
//
// Usage:  node scripts/memory.mjs <command> [options]   (run from the project root, or pass --root <dir>)
//
//   init                                   create the db (imports .foreman/MEMORY.md if the db is missing)
//   briefing                               ~10-line summary for session start
//   stats
//   feature start   --title T [--summary S] [--tags a,b] [--files p1,p2]        -> prints id
//   feature finish  <id> --outcome done|partial|abandoned [--summary S] [--files ...] [--iterations N] [--flipped "..."] [--review ...] [--security ...]
//   feature list    [--limit N]
//   feature show    <id>
//   lesson add      --text T [--kind gotcha|convention|pattern|process] [--feature ID] [--paths p1,p2]
//   lesson list     [--limit N]
//   decision add    --text T [--source user|docs|inferred] [--confirmed 0|1] [--area A]
//   decision list
//   backlog add     --title T --area security|performance|architecture|testing|dx|deps|product|other --severity critical|high|medium|low [--plan P] [--effort s|m|l] [--paths ...]
//   backlog list    [--status open|done|dismissed|all]
//   backlog update  <id> --status open|done|dismissed [--feature ID]
//   recall          <query> [--limit N]      full-text search across everything
//   relevant        [--paths p1,p2] [--text "..."] [--limit N]   lessons+decisions for a brief
//   export                                  write .foreman/MEMORY.md (human-readable + JSON snapshot)
//   import                                  rebuild db from .foreman/MEMORY.md
//
// Output is plain text unless --json is passed.

process.removeAllListeners("warning");
process.on("warning", () => {});

import fs from "node:fs";
import path from "node:path";

let DatabaseSync;
try {
  ({ DatabaseSync } = await import("node:sqlite"));
} catch {
  console.error("foreman memory needs Node >= 22.13 (built-in node:sqlite). Current: " + process.version);
  process.exit(2);
}

// ---------- args ----------
const argv = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith("--")) {
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) flags[key] = true;
    else { flags[key] = next; i++; }
  } else positional.push(a);
}
const [cmd, sub, ...rest] = positional;
const ROOT = path.resolve(flags.root || process.cwd());
const DIR = path.join(ROOT, ".foreman");
const DB_PATH = path.join(DIR, "memory.db");
const MD_PATH = path.join(DIR, "MEMORY.md");
const JSON_OUT = !!flags.json;
const list = (v) => (typeof v === "string" && v.length ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);
const now = () => new Date().toISOString();
const TTY = process.stdout.isTTY && !flags["no-color"] && !process.env.NO_COLOR;
const C = TTY ? { r: "\x1b[0m", b: "\x1b[1m", dim: "\x1b[2m", am: "\x1b[38;5;214m", gr: "\x1b[38;5;114m", rd: "\x1b[38;5;203m", bl: "\x1b[38;5;75m", gy: "\x1b[38;5;245m", mg: "\x1b[38;5;176m" }
  : { r: "", b: "", dim: "", am: "", gr: "", rd: "", bl: "", gy: "", mg: "" };
const sev = (v) => ({ critical: C.rd + C.b, high: C.rd, medium: C.am, low: C.gy }[v] ?? "") + v + C.r;
const st = (v) => v === "done" || v === "passed" ? C.gr + "●" + C.r : v === "in_progress" || v === "open" ? C.am + "◐" + C.r : v === "abandoned" || v === "failed" ? C.rd + "✕" + C.r : C.gy + "○" + C.r;
const out = (text, obj) => console.log(JSON_OUT ? JSON.stringify(obj ?? text, null, 2) : text);

// ---------- schema ----------
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
CREATE VIRTUAL TABLE IF NOT EXISTS fts USING fts5(kind, ref_id UNINDEXED, title, body, paths, tokenize='trigram');
`;

function openDb() {
  fs.mkdirSync(DIR, { recursive: true });
  const fresh = !fs.existsSync(DB_PATH);
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode=WAL;");
  db.exec(SCHEMA);
  if (fresh && fs.existsSync(MD_PATH)) importFromMd(db);
  return db;
}

function ftsUpsert(db, kind, refId, title, body, paths) {
  db.prepare("DELETE FROM fts WHERE kind=? AND ref_id=?").run(kind, refId);
  db.prepare("INSERT INTO fts (kind, ref_id, title, body, paths) VALUES (?,?,?,?,?)").run(kind, refId, title ?? "", body ?? "", paths ?? "");
}
function ftsQuery(q) {
  // trigram tokenizer: substring matches on identifiers; tokens shorter than 3 chars can't match, so drop them
  const toks = q.split(/\s+/).map((t) => t.replace(/"/g, "")).filter((t) => t.length >= 3);
  if (!toks.length) return '"' + q.replace(/"/g, "") + '"';
  return toks.map((t) => '"' + t + '"').join(" OR ");
}

// ---------- commands ----------
const commands = {
  init(db) {
    out(`memory ready: ${path.relative(ROOT, DB_PATH)}`, { db: DB_PATH });
  },

  stats(db) {
    const c = (t, w = "") => db.prepare(`SELECT COUNT(*) n FROM ${t} ${w}`).get().n;
    const s = { features: c("features"), done: c("features", "WHERE outcome='done'"), lessons: c("lessons"), decisions: c("decisions"), backlogOpen: c("backlog", "WHERE status='open'") };
    out(Object.entries(s).map(([k, v]) => `${k}: ${v}`).join("\n"), s);
  },

  briefing(db) {
    const feats = db.prepare("SELECT id,title,outcome,finished,started FROM features ORDER BY id DESC LIMIT 3").all();
    const open = db.prepare("SELECT COUNT(*) n FROM backlog WHERE status='open'").get().n;
    const crit = db.prepare("SELECT COUNT(*) n FROM backlog WHERE status='open' AND severity IN ('critical','high')").get().n;
    const lessons = db.prepare("SELECT COUNT(*) n FROM lessons").get().n;
    const recentLessons = db.prepare("SELECT kind,text FROM lessons ORDER BY id DESC LIMIT 3").all();
    const inprog = db.prepare("SELECT id,title FROM features WHERE outcome='in_progress' ORDER BY id DESC LIMIT 1").get();
    const project = path.basename(ROOT);
    const lines = [`${C.am}${C.b}⚒ foreman${C.r} ${C.gy}·${C.r} ${project}`];
    if (inprog) lines.push(`  ${C.dim}in progress${C.r}  #${inprog.id} ${inprog.title}`);
    if (feats.length) lines.push(`  ${C.dim}recent${C.r}       ` + feats.filter((f) => f.outcome !== "in_progress").map((f) => `#${f.id} ${st(f.outcome)} ${f.title}`).join(" · "));
    lines.push(`  ${C.dim}backlog${C.r}      ${open} open (${crit} critical/high) · lessons ${lessons}`);
    for (const l of recentLessons) lines.push(`  ${C.gy}·${C.r} ${C.mg}${l.kind.padEnd(10)}${C.r} ${l.text.slice(0, 100)}`);
    lines.push(`  ${C.gy}/foreman:feature · /foreman:review · /foreman:recall · /foreman:map${C.r}`);
    out(lines.join("\n"), { inprog, feats, open, crit, lessons, recentLessons });
  },

  feature(db) {
    if (sub === "start") {
      const title = flags.title; if (!title) die("--title required");
      const r = db.prepare("INSERT INTO features (title,summary,tags,files,started) VALUES (?,?,?,?,?)").run(title, flags.summary ?? "", list(flags.tags).join(","), list(flags.files).join(","), now());
      const id = Number(r.lastInsertRowid);
      ftsUpsert(db, "feature", id, title, [flags.summary, flags.tags].filter(Boolean).join(" "), list(flags.files).join(" "));
      out(String(id), { id });
    } else if (sub === "finish") {
      const id = Number(rest[0]); if (!id) die("feature finish <id>");
      const f = db.prepare("SELECT * FROM features WHERE id=?").get(id); if (!f) die("no feature " + id);
      const files = list(flags.files).length ? list(flags.files).join(",") : f.files;
      db.prepare("UPDATE features SET outcome=?, summary=?, files=?, iterations=?, flipped=?, review=?, security=?, finished=? WHERE id=?")
        .run(flags.outcome ?? "done", flags.summary ?? f.summary, files, Number(flags.iterations ?? f.iterations), flags.flipped ?? f.flipped, flags.review ?? f.review, flags.security ?? f.security, now(), id);
      ftsUpsert(db, "feature", id, f.title, [flags.summary ?? f.summary, f.tags, flags.flipped, flags.review, flags.security].filter(Boolean).join(" "), files.replace(/,/g, " "));
      commands.export(db, true);
      out(`feature #${id} ${flags.outcome ?? "done"}`, { id, outcome: flags.outcome ?? "done" });
    } else if (sub === "list") {
      const rows = db.prepare("SELECT id,title,outcome,iterations,started,finished FROM features ORDER BY id DESC LIMIT ?").all(Number(flags.limit ?? 20));
      out(rows.map((r) => `${st(r.outcome)} ${C.b}#${r.id}${C.r} ${r.title}${r.iterations ? ` ${C.dim}(${r.iterations} it.)${C.r}` : ""} ${C.gy}${(r.finished ?? r.started).slice(0, 10)}${C.r}`).join("\n") || "(none)", rows);
    } else if (sub === "show") {
      const id = Number(rest[0]); const f = db.prepare("SELECT * FROM features WHERE id=?").get(id); if (!f) die("no feature " + id);
      const ls = db.prepare("SELECT kind,text,paths FROM lessons WHERE feature_id=?").all(id);
      out([`#${f.id} ${f.title} [${f.outcome}]`, f.summary, `files: ${f.files}`, `iterations: ${f.iterations}  flipped: ${f.flipped}`, `review: ${f.review}`, `security: ${f.security}`, ...ls.map((l) => `· ${l.kind}: ${l.text}`)].filter(Boolean).join("\n"), { ...f, lessons: ls });
    } else die("feature start|finish|list|show");
  },

  lesson(db) {
    if (sub === "add") {
      const text = flags.text; if (!text) die("--text required");
      const paths = list(flags.paths).join(",");
      const r = db.prepare("INSERT INTO lessons (feature_id,kind,text,paths,created) VALUES (?,?,?,?,?)").run(flags.feature ? Number(flags.feature) : null, flags.kind ?? "gotcha", text, paths, now());
      const id = Number(r.lastInsertRowid);
      ftsUpsert(db, "lesson", id, flags.kind ?? "gotcha", text, paths.replace(/,/g, " "));
      out(String(id), { id });
    } else if (sub === "list") {
      const rows = db.prepare("SELECT id,kind,text,paths,feature_id FROM lessons ORDER BY id DESC LIMIT ?").all(Number(flags.limit ?? 30));
      out(rows.map((r) => `${C.b}#${r.id}${C.r} ${C.mg}${r.kind}${C.r} ${r.text}${r.paths ? ` ${C.gy}(${r.paths})${C.r}` : ""}`).join("\n") || "(none)", rows);
    } else die("lesson add|list");
  },

  decision(db) {
    if (sub === "add") {
      const text = flags.text; if (!text) die("--text required");
      const r = db.prepare("INSERT INTO decisions (text,source,confirmed,area,created) VALUES (?,?,?,?,?)").run(text, flags.source ?? "user", Number(flags.confirmed ?? 1), flags.area ?? "", now());
      const id = Number(r.lastInsertRowid);
      ftsUpsert(db, "decision", id, flags.area ?? "", text, "");
      out(String(id), { id });
    } else if (sub === "list") {
      const rows = db.prepare("SELECT id,text,source,confirmed,area FROM decisions ORDER BY id").all();
      out(rows.map((r) => `${C.b}#${r.id}${C.r} ${r.confirmed ? C.gr + "confirmed" : C.gy + "inferred"}${C.r}${r.area ? ` ${C.bl}${r.area}${C.r}` : ""} ${r.text}`).join("\n") || "(none)", rows);
    } else die("decision add|list");
  },

  backlog(db) {
    if (sub === "add") {
      const { title, area, severity } = flags; if (!title || !area || !severity) die("--title --area --severity required");
      const paths = list(flags.paths).join(",");
      const r = db.prepare("INSERT INTO backlog (area,severity,title,plan,effort,paths,status,created,updated) VALUES (?,?,?,?,?,?,'open',?,?)").run(area, severity, title, flags.plan ?? "", flags.effort ?? "", paths, now(), now());
      const id = Number(r.lastInsertRowid);
      ftsUpsert(db, "backlog", id, title, [area, severity, flags.plan].filter(Boolean).join(" "), paths.replace(/,/g, " "));
      out(String(id), { id });
    } else if (sub === "list") {
      const status = flags.status ?? "open";
      const order = "CASE severity WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, id";
      const rows = status === "all" ? db.prepare(`SELECT * FROM backlog ORDER BY ${order}`).all() : db.prepare(`SELECT * FROM backlog WHERE status=? ORDER BY ${order}`).all(status);
      out((rows.length ? [`${C.dim}#    sev       area           eff  title${C.r}`] : []).concat(rows.map((r) => `${String(r.id).padEnd(4)} ${sev(r.severity).padEnd(9 + (sev(r.severity).length - r.severity.length))} ${C.bl}${r.area.padEnd(14)}${C.r} ${(r.effort || "-").padEnd(4)} ${r.title}${r.status !== "open" ? ` ${C.gy}— ${r.status}${C.r}` : ""}`)).join("\n") || "(none)", rows);
    } else if (sub === "update") {
      const id = Number(rest[0]); if (!id || !flags.status) die("backlog update <id> --status ...");
      db.prepare("UPDATE backlog SET status=?, feature_id=COALESCE(?, feature_id), updated=? WHERE id=?").run(flags.status, flags.feature ? Number(flags.feature) : null, now(), id);
      commands.export(db, true);
      out(`backlog #${id} ${flags.status}`, { id, status: flags.status });
    } else die("backlog add|list|update");
  },

  recall(db) {
    const q = [sub, ...rest].filter(Boolean).join(" "); if (!q) die("recall <query>");
    const rows = db.prepare("SELECT kind, ref_id, title, snippet(fts, 3, '[', ']', '…', 64) AS snip, bm25(fts) AS rank FROM fts WHERE fts MATCH ? ORDER BY rank LIMIT ?").all(ftsQuery(q), Number(flags.limit ?? 12));
    out(rows.map((r) => `${C.bl}${r.kind.padEnd(8)}${C.r} ${C.b}#${r.ref_id}${C.r} ${r.title ? r.title + ": " : ""}${r.snip.replace(/\[/g, C.am).replace(/\]/g, C.r)}`).join("\n") || "(no matches)", rows);
  },

  relevant(db) {
    const paths = list(flags.paths);
    const text = flags.text ?? "";
    const limit = Number(flags.limit ?? 10);
    const seen = new Set(); const hits = [];
    const push = (kind, id, line) => { const k = kind + id; if (!seen.has(k)) { seen.add(k); hits.push({ kind, id, line }); } };
    // path matches: lessons/decisions/backlog whose paths share a prefix with any changed path (or its directory)
    for (const p of paths) {
      const dir = p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : p;
      for (const l of db.prepare("SELECT id,kind,text,paths FROM lessons WHERE paths LIKE ? OR paths LIKE ?").all(`%${p}%`, `%${dir}%`)) push("lesson", l.id, `[${l.kind}] ${l.text} (${l.paths})`);
      for (const b of db.prepare("SELECT id,severity,title,paths FROM backlog WHERE status='open' AND (paths LIKE ? OR paths LIKE ?)").all(`%${p}%`, `%${dir}%`)) push("backlog", b.id, `[${b.severity}] ${b.title} (${b.paths})`);
    }
    if (text.trim()) {
      for (const r of db.prepare("SELECT kind, ref_id, title, body FROM fts WHERE fts MATCH ? AND kind IN ('lesson','decision','feature') ORDER BY bm25(fts) LIMIT ?").all(ftsQuery(text), limit)) {
        push(r.kind, r.ref_id, r.kind === "lesson" ? `[${r.title}] ${r.body}` : r.kind === "decision" ? r.body : `feature: ${r.title} — ${r.body.slice(0, 140)}`);
      }
    }
    for (const d of db.prepare("SELECT id,text FROM decisions WHERE confirmed=1 ORDER BY id DESC LIMIT 8").all()) push("decision", d.id, d.text);
    const top = hits.slice(0, limit + 8);
    out(top.map((h) => `${h.kind} #${h.id}: ${h.line}`).join("\n") || "(nothing relevant yet)", top);
  },

  export(db, quiet = false) {
    const dump = {
      exported: now(),
      features: db.prepare("SELECT * FROM features ORDER BY id").all(),
      lessons: db.prepare("SELECT * FROM lessons ORDER BY id").all(),
      decisions: db.prepare("SELECT * FROM decisions ORDER BY id").all(),
      backlog: db.prepare("SELECT * FROM backlog ORDER BY id").all(),
    };
    const md = [];
    md.push("# foreman memory", "", `_Exported ${dump.exported}. Human-readable view; the JSON block at the end is the source of truth and rebuilds \`.foreman/memory.db\` on \`memory import\`._`, "");
    md.push("## Decisions"); for (const d of dump.decisions) md.push(`- ${d.confirmed ? "✅" : "〰️"} ${d.area ? `**${d.area}** · ` : ""}${d.text}`); if (!dump.decisions.length) md.push("- (none)");
    md.push("", "## Lessons"); for (const l of dump.lessons) md.push(`- **${l.kind}** ${l.text}${l.paths ? ` _(${l.paths})_` : ""}${l.feature_id ? ` — feature #${l.feature_id}` : ""}`); if (!dump.lessons.length) md.push("- (none)");
    md.push("", "## Backlog (open)"); const ob = dump.backlog.filter((b) => b.status === "open"); for (const b of ob) md.push(`- #${b.id} **${b.severity}** [${b.area}] ${b.title}${b.effort ? ` (${b.effort})` : ""}${b.plan ? ` — ${b.plan}` : ""}`); if (!ob.length) md.push("- (none)");
    md.push("", "## Features"); for (const f of [...dump.features].reverse()) md.push(`- #${f.id} **${f.title}** [${f.outcome}] ${f.summary}${f.iterations ? ` · ${f.iterations} iterations` : ""}${f.flipped ? ` · flipped: ${f.flipped}` : ""}`); if (!dump.features.length) md.push("- (none)");
    md.push("", "<!-- foreman:snapshot -->", "```json", JSON.stringify(dump, null, 1), "```", "");
    fs.writeFileSync(MD_PATH, md.join("\n"));
    if (!quiet) out(`exported ${path.relative(ROOT, MD_PATH)}`, { path: MD_PATH });
  },

  import(db) { importFromMd(db); out("imported from MEMORY.md"); },
};

function importFromMd(db) {
  if (!fs.existsSync(MD_PATH)) return;
  const m = fs.readFileSync(MD_PATH, "utf8").match(/<!-- foreman:snapshot -->\s*```json\s*([\s\S]*?)```/);
  if (!m) return;
  let dump; try { dump = JSON.parse(m[1]); } catch { return; }
  db.exec("DELETE FROM features; DELETE FROM lessons; DELETE FROM decisions; DELETE FROM backlog; DELETE FROM fts;");
  const ins = (table, rows) => {
    for (const r of rows) {
      const cols = Object.keys(r); db.prepare(`INSERT INTO ${table} (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`).run(...cols.map((c) => r[c]));
    }
  };
  ins("features", dump.features ?? []); ins("lessons", dump.lessons ?? []); ins("decisions", dump.decisions ?? []); ins("backlog", dump.backlog ?? []);
  for (const f of dump.features ?? []) ftsUpsert(db, "feature", f.id, f.title, [f.summary, f.tags, f.flipped, f.review, f.security].filter(Boolean).join(" "), (f.files ?? "").replace(/,/g, " "));
  for (const l of dump.lessons ?? []) ftsUpsert(db, "lesson", l.id, l.kind, l.text, (l.paths ?? "").replace(/,/g, " "));
  for (const d of dump.decisions ?? []) ftsUpsert(db, "decision", d.id, d.area ?? "", d.text, "");
  for (const b of dump.backlog ?? []) ftsUpsert(db, "backlog", b.id, b.title, [b.area, b.severity, b.plan].filter(Boolean).join(" "), (b.paths ?? "").replace(/,/g, " "));
}

function die(msg) { console.error("memory: " + msg); process.exit(1); }

if (!cmd || !commands[cmd]) {
  console.log(fs.readFileSync(new URL(import.meta.url)).toString().split("\n").filter((l) => l.startsWith("//")).map((l) => l.slice(3)).join("\n"));
  process.exit(cmd ? 1 : 0);
}
const db = openDb();
try { commands[cmd](db); } finally { db.close(); }
