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
//   dispatch start  --feature ID --iteration N --role R --model M [--unit U] [--type T] [--paths ...]   -> prints id
//   dispatch finish <id> --outcome O [--tokens N] [--tool-uses N] [--duration S] [--notes ...]
//   dispatch list   [--feature ID]
//   dispatch mark-first-pass --feature ID --iteration N --result PASSED|FAILED|INCONCLUSIVE [--failed-paths p1,p2]
//   gate add        --feature ID --iteration N --gate verify|review|security --result R [--count N] [--categories ...]
//   cost            <feature_id>             tokens and estimated cost by role and iteration
//   feature report  <id> [--json]            write .foreman/reports/<id>.md
//   routing         [--type T] [--paths P]   first-pass evidence per task type × model
//   routing suggest --role implementer --type T [--paths P]   cheapest model with enough evidence
//   confidence      --types T,T --paths P    0–1 score for running a task unattended, with its top 3 contributors
//   export                                  write .foreman/MEMORY.md (human-readable + JSON snapshot)
//   import                                  rebuild db from .foreman/MEMORY.md
//
// Output is plain text unless --json is passed.

process.removeAllListeners("warning");
process.on("warning", () => {});

import fs from "node:fs";
import path from "node:path";
import os from "node:os";

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
CREATE TABLE IF NOT EXISTS dispatches (
  id INTEGER PRIMARY KEY, feature_id INTEGER NOT NULL, iteration INTEGER NOT NULL, role TEXT NOT NULL, model TEXT NOT NULL,
  unit TEXT DEFAULT '', task_type TEXT DEFAULT 'other', paths TEXT DEFAULT '', started TEXT NOT NULL, finished TEXT,
  duration_s INTEGER, tokens INTEGER, tool_uses INTEGER, outcome TEXT, first_pass INTEGER, notes TEXT DEFAULT ''
);
CREATE TABLE IF NOT EXISTS gate_events (
  id INTEGER PRIMARY KEY, feature_id INTEGER NOT NULL, iteration INTEGER NOT NULL, gate TEXT NOT NULL, result TEXT NOT NULL,
  finding_count INTEGER DEFAULT 0, categories TEXT DEFAULT '', created TEXT NOT NULL
);
CREATE VIRTUAL TABLE IF NOT EXISTS fts USING fts5(kind, ref_id UNINDEXED, title, body, paths, tokenize='trigram');
`;

const TASK_TYPES = ["api", "data-model", "migration", "ui", "auth", "test", "refactor", "config", "infra", "docs", "other"];
const OUTCOMES = { scout: ["DONE"], implementer: ["DONE", "PARTIAL", "BLOCKED"], verifier: ["PASSED", "FAILED", "INCONCLUSIVE"], reviewer: ["APPROVE", "REQUEST_CHANGES"], security: ["PASS", "PASS_WITH_FINDINGS", "FAIL"] };
const GATE_ROLE = { verify: "verifier", review: "reviewer", security: "security" };
const CATEGORIES = ["type-error", "test-fail", "lint", "convention", "correctness", "design", "security-high", "security-medium", "security-low", "flaky", "env", "auto-applied"];
const oneOf = (v, allowed, name) => { if (!allowed.includes(v)) die(`--${name} must be one of ${allowed.join("|")}${v === undefined || v === true ? "" : ` (got ${v})`}`); return v; };
const int = (v, name) => { const n = Number(v); if (v === undefined || v === true || !Number.isInteger(n) || n < 0) die(`--${name} must be a whole number`); return n; };
const optInt = (v, name) => (v === undefined ? null : int(v, name));
const norm = (p) => p.trim().replace(/^\.\//, "").replace(/\/+$/, "");
const overlaps = (a, b) => a === b || a.startsWith(b + "/") || b.startsWith(a + "/");
const touches = (csv, queries) => queries.length > 0 && list(csv).map(norm).some((s) => queries.some((q) => overlaps(s, q)));

const DEFAULTS = {
  prices: { haiku: { perMTok: 0.15, currency: "GBP" }, sonnet: { perMTok: 2.8, currency: "GBP" }, opus: { perMTok: 5.6, currency: "GBP" }, fable: { perMTok: 14, currency: "GBP" } },
  routing: { mode: "static", threshold: 0.8, minSamples: 5 },
  autonomy: { autoAt: 0.85, askBelow: 0.5 },
  models: { implementer: "sonnet" },
};
function loadConfig() {
  const read = (f) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return {}; } };
  const cfg = structuredClone(DEFAULTS);
  for (const layer of [read(path.join(os.homedir(), ".claude", "foreman.json")), read(path.join(DIR, "config.json"))])
    for (const [k, v] of Object.entries(layer)) cfg[k] = v && typeof v === "object" && !Array.isArray(v) && typeof cfg[k] === "object" ? { ...cfg[k], ...v } : v;
  return cfg;
}
const priceOf = (model, prices) => prices[model] ?? Object.entries(prices).find(([k]) => model.includes(k))?.[1] ?? null;
const aliasOf = (model, prices) => (prices[model] ? model : Object.keys(prices).find((k) => model.includes(k)) ?? model);
function loadPriors() {
  try { return JSON.parse(fs.readFileSync(new URL("../priors.json", import.meta.url), "utf8")).rows ?? []; } catch { return []; }
}
const priorFor = (priors, role, type, model) => priors.find((p) => p.role === role && p.type === type && p.model === model) ?? priors.find((p) => p.role === role && p.type === "*" && p.model === model) ?? { rate: 0, n: 0 };
const blend = (pass, n, prior) => (n + prior.n ? (pass + prior.rate * prior.n) / (n + prior.n) : null);
function judgedRows(db, role, types, paths) {
  const q = paths.map(norm);
  return db.prepare("SELECT d.*, f.iterations AS feature_iterations FROM dispatches d LEFT JOIN features f ON f.id = d.feature_id WHERE d.role=?").all(role)
    .filter((r) => (!types.length || types.includes(r.task_type)) && (!q.length || touches(r.paths, q)));
}
const SYM = { GBP: "£", USD: "$", EUR: "€" };
const money = (n, cur) => (SYM[cur] ?? (cur ? cur + " " : "")) + n.toFixed(2);
const ktok = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? Math.round(n / 1e3) + "k" : String(n));
function costRows(rows, prices) {
  return rows.map((r) => { const p = r.tokens ? priceOf(r.model, prices) : null; return { ...r, cost: p ? (r.tokens / 1e6) * p.perMTok : 0, currency: p?.currency ?? null }; });
}
function featureStats(db, prices) {
  const stats = new Map();
  for (const r of costRows(db.prepare("SELECT * FROM dispatches").all(), prices)) {
    const s = stats.get(r.feature_id) ?? { tokens: 0, cost: 0, currency: null, firstPass: 0, judged: 0 };
    s.tokens += r.tokens ?? 0; s.cost += r.cost; s.currency ??= r.currency;
    if (r.first_pass !== null) { s.judged++; s.firstPass += r.first_pass; }
    stats.set(r.feature_id, s);
  }
  return stats;
}
const statLine = (s) => [s.tokens ? `${ktok(s.tokens)} tok ${money(s.cost, s.currency)}` : "", s.judged ? `first-pass ${s.firstPass}/${s.judged}` : ""].filter(Boolean).join(" · ");

const GITIGNORE = "# managed by foreman: local state only; the .md/.json files beside this are meant to be committed\nmemory.db\nmemory.db-*\nrun.json\n";
function openDb() {
  fs.mkdirSync(DIR, { recursive: true });
  const gi = path.join(DIR, ".gitignore");
  if (!fs.existsSync(gi)) fs.writeFileSync(gi, GITIGNORE);
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
    if (loadConfig().routing.mode === "static") {
      const ev = db.prepare("SELECT COUNT(DISTINCT f.id) n FROM features f JOIN dispatches d ON d.feature_id=f.id WHERE f.outcome!='in_progress'").get().n;
      if (ev >= 10) lines.push(`  ${C.dim}evidence${C.r}     ${ev} features with dispatches · routing could use it: /foreman:config routing=evidence`);
    }
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
      const stats = featureStats(db, loadConfig().prices);
      const showCost = [...stats.values()].some((s) => s.tokens);
      const rows = db.prepare("SELECT id,title,outcome,iterations,started,finished FROM features ORDER BY id DESC LIMIT ?").all(Number(flags.limit ?? 20))
        .map((r) => (showCost ? { ...r, tokens: stats.get(r.id)?.tokens ?? 0, cost: stats.get(r.id)?.cost ?? 0 } : r));
      const cur = [...stats.values()].find((s) => s.currency)?.currency;
      out(rows.map((r) => `${st(r.outcome)} ${C.b}#${r.id}${C.r} ${r.title}${r.iterations ? ` ${C.dim}(${r.iterations} it.)${C.r}` : ""}${showCost && r.tokens ? ` ${C.am}${money(r.cost, cur)}${C.r}` : ""} ${C.gy}${(r.finished ?? r.started).slice(0, 10)}${C.r}`).join("\n") || "(none)", rows);
    } else if (sub === "show") {
      const id = Number(rest[0]); const f = db.prepare("SELECT * FROM features WHERE id=?").get(id); if (!f) die("no feature " + id);
      const ls = db.prepare("SELECT kind,text,paths FROM lessons WHERE feature_id=?").all(id);
      out([`#${f.id} ${f.title} [${f.outcome}]`, f.summary, `files: ${f.files}`, `iterations: ${f.iterations}  flipped: ${f.flipped}`, `review: ${f.review}`, `security: ${f.security}`, ...ls.map((l) => `· ${l.kind}: ${l.text}`)].filter(Boolean).join("\n"), { ...f, lessons: ls });
    } else if (sub === "report") {
      const id = Number(rest[0]); const f = db.prepare("SELECT * FROM features WHERE id=?").get(id); if (!f) die("feature report <id>");
      const prices = loadConfig().prices;
      const ds = costRows(db.prepare("SELECT * FROM dispatches WHERE feature_id=? ORDER BY id").all(id), prices);
      const gates = db.prepare("SELECT * FROM gate_events WHERE feature_id=? ORDER BY id").all(id);
      const lessons = db.prepare("SELECT kind,text,paths FROM lessons WHERE feature_id=? ORDER BY id").all(id);
      const c = summarizeCost(ds);
      const units = ds.filter((d) => d.role === "implementer");
      const fp = (v) => (v === null ? "—" : v ? "yes" : "no");
      const md = [`# Feature #${f.id}: ${f.title}`, "", `**Outcome** ${f.outcome} · **iterations** ${f.iterations} · ${f.started.slice(0, 10)}${f.finished ? ` → ${f.finished.slice(0, 10)}` : ""}`, ""];
      if (f.summary) md.push(f.summary, "");
      md.push("## Units", "", "| it | unit | model | type | outcome | first pass | tokens |", "|---|---|---|---|---|---|---|");
      for (const u of units) md.push(`| ${u.iteration} | ${u.unit || "—"} | ${u.model} | ${u.task_type} | ${u.outcome ?? "—"} | ${fp(u.first_pass)} | ${u.tokens ?? "—"} |`);
      if (!units.length) md.push("| | (no implementer dispatches recorded) | | | | | |");
      md.push("", "## Iterations", "");
      const its = [...new Set(ds.map((d) => d.iteration).concat(gates.map((g) => g.iteration)))].sort((a, b) => a - b);
      for (const it of its) {
        const work = ds.filter((d) => d.iteration === it).map((d) => `${d.role} ${d.outcome ?? "…"}`).join(", ");
        const verdicts = gates.filter((g) => g.iteration === it).map((g) => `${g.gate} ${g.result}`).join(", ");
        md.push(`- **${it}**: ${[work, verdicts].filter(Boolean).join(" · ")}`);
      }
      if (f.flipped) md.push(`- flipped: ${f.flipped}`);
      md.push("", "## Gate events", "", "| it | gate | result | findings | categories |", "|---|---|---|---|---|");
      for (const g of gates) md.push(`| ${g.iteration} | ${g.gate} | ${g.result} | ${g.finding_count} | ${g.categories || "—"} |`);
      md.push("", "## Lessons", "");
      for (const l of lessons) md.push(`- **${l.kind}** ${l.text}${l.paths ? ` _(${l.paths})_` : ""}`);
      if (!lessons.length) md.push("- (none)");
      md.push("", "## Cost", "", c.tokens ? `${ktok(c.tokens)} tokens · ${money(c.cost, c.currency)} estimated (blended prices from config)` : "No token counts recorded.");
      if (c.tokens) md.push("", `By role: ${Object.entries(c.byRole).map(([k, v]) => `${k} ${money(v.cost, c.currency)}`).join(" · ")}`, `Priciest: #${c.top.id} ${c.top.role} ${c.top.model} ${c.top.unit || ""} ${money(c.top.cost, c.currency)}`.trimEnd());
      md.push("");
      const rp = path.join(DIR, "reports", `${id}.md`);
      fs.mkdirSync(path.dirname(rp), { recursive: true });
      fs.writeFileSync(rp, md.join("\n"));
      out(path.relative(ROOT, rp), { path: rp, feature: f, units, gates, lessons, cost: c });
    } else die("feature start|finish|list|show|report");
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
    const queries = paths.flatMap((p) => { const n = norm(p); return n.includes("/") ? [n, n.slice(0, n.lastIndexOf("/"))] : [n]; });
    for (const l of db.prepare("SELECT id,kind,text,paths FROM lessons WHERE paths != ''").all()) if (touches(l.paths, queries)) push("lesson", l.id, `[${l.kind}] ${l.text} (${l.paths})`);
    for (const b of db.prepare("SELECT id,severity,title,paths FROM backlog WHERE status='open' AND paths != ''").all()) if (touches(b.paths, queries)) push("backlog", b.id, `[${b.severity}] ${b.title} (${b.paths})`);
    if (text.trim()) {
      for (const r of db.prepare("SELECT kind, ref_id, title, body FROM fts WHERE fts MATCH ? AND kind IN ('lesson','decision','feature') ORDER BY bm25(fts) LIMIT ?").all(ftsQuery(text), limit)) {
        push(r.kind, r.ref_id, r.kind === "lesson" ? `[${r.title}] ${r.body}` : r.kind === "decision" ? r.body : `feature: ${r.title} — ${r.body.slice(0, 140)}`);
      }
    }
    for (const d of db.prepare("SELECT id,text FROM decisions WHERE confirmed=1 ORDER BY id DESC LIMIT 8").all()) push("decision", d.id, d.text);
    const top = hits.slice(0, limit + 8);
    out(top.map((h) => `${h.kind} #${h.id}: ${h.line}`).join("\n") || "(nothing relevant yet)", top);
  },

  cost(db) {
    const id = Number(sub); const f = db.prepare("SELECT id,title FROM features WHERE id=?").get(id); if (!f) die("cost <feature_id>");
    const c = summarizeCost(costRows(db.prepare("SELECT * FROM dispatches WHERE feature_id=?").all(id), loadConfig().prices));
    if (!c.tokens) return out(`#${id} no token counts recorded`, c);
    const part = (o) => Object.entries(o).map(([k, v]) => `${k} ${ktok(v.tokens)} ${money(v.cost, c.currency)}`).join(" · ");
    out([`${C.b}#${id}${C.r} ${f.title} · ${ktok(c.tokens)} tok · ${C.am}${money(c.cost, c.currency)}${C.r} est.`,
      `  ${C.dim}by role${C.r}       ${part(c.byRole)}`, `  ${C.dim}by iteration${C.r}  ${part(Object.fromEntries(Object.entries(c.byIteration).map(([k, v]) => ["it" + k, v])))}`,
      `  ${C.dim}priciest${C.r}      #${c.top.id} ${c.top.role} ${c.top.model}${c.top.unit ? ` ${c.top.unit}` : ""} ${ktok(c.top.tokens)} ${money(c.top.cost, c.currency)}`].join("\n"), c);
  },

  routing(db) {
    const cfg = loadConfig();
    const types = list(flags.type);
    for (const t of types) oneOf(t, TASK_TYPES, "type");
    const paths = list(flags.paths);
    if (sub === "suggest") {
      const role = oneOf(flags.role ?? "implementer", Object.keys(OUTCOMES), "role");
      if (types.length !== 1) die("routing suggest needs one --type");
      const type = types[0];
      const fallback = cfg.models?.[role] ?? DEFAULTS.models.implementer;
      const { threshold, minSamples } = cfg.routing;
      const priors = loadPriors();
      const rows = judgedRows(db, role, types, paths).filter((r) => r.first_pass !== null);
      const candidates = Object.entries(cfg.prices).sort((a, b) => a[1].perMTok - b[1].perMTok).map(([m]) => m);
      let skipped = null, pick = null;
      for (const model of candidates) {
        const mine = rows.filter((r) => aliasOf(r.model, cfg.prices) === model);
        const pass = mine.filter((r) => r.first_pass).length;
        const rate = blend(pass, mine.length, priorFor(priors, role, type, model));
        const basis = `${model} first-pass on ${type} ${pass}/${mine.length} here`;
        if (mine.length >= minSamples && rate >= threshold) { pick = { model, rate, n: mine.length, basis: skipped ?? basis }; break; }
        if (mine.length >= minSamples && !skipped) skipped = basis;
      }
      const res = pick ?? { model: fallback, rate: null, n: rows.length, basis: skipped && rows.length >= minSamples ? `${skipped}; none reach ${threshold}` : `insufficient evidence (n=${rows.length})` };
      return out(`${role}: ${res.model} (${res.basis})`, { role, type, ...res });
    }
    if (sub) die("routing [--type T] [--paths P] | routing suggest --role R --type T");
    const groups = new Map();
    for (const r of judgedRows(db, "implementer", types, paths)) {
      const k = r.task_type + "\t" + aliasOf(r.model, cfg.prices);
      const g = groups.get(k) ?? { type: r.task_type, model: aliasOf(r.model, cfg.prices), dispatches: 0, judged: 0, firstPass: 0, features: new Map(), tokens: [] };
      g.dispatches++;
      if (r.first_pass !== null) { g.judged++; g.firstPass += r.first_pass; }
      g.features.set(r.feature_id, r.feature_iterations ?? 0);
      if (r.tokens) g.tokens.push(r.tokens);
      groups.set(k, g);
    }
    const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
    const rows = [...groups.values()].map((g) => ({ type: g.type, model: g.model, dispatches: g.dispatches, judged: g.judged, firstPassRate: g.judged ? g.firstPass / g.judged : null, meanIterations: mean([...g.features.values()]), meanTokens: mean(g.tokens) }))
      .sort((a, b) => a.type.localeCompare(b.type) || a.model.localeCompare(b.model));
    const pct = (v) => (v === null ? "—" : Math.round(v * 100) + "%");
    out((rows.length ? [`${C.dim}type        model    n    first-pass  iter  tokens${C.r}`] : []).concat(rows.map((r) =>
      `${C.mg}${r.type.padEnd(11)}${C.r} ${r.model.padEnd(8)} ${String(r.dispatches).padEnd(4)} ${(pct(r.firstPassRate) + (r.judged ? ` ${Math.round(r.firstPassRate * r.judged)}/${r.judged}` : "")).padEnd(11)} ${(r.meanIterations === null ? "—" : r.meanIterations.toFixed(1)).padEnd(5)} ${r.meanTokens === null ? "—" : ktok(Math.round(r.meanTokens))}`)).join("\n") || "(no implementer dispatches yet)", rows);
  },

  confidence(db) {
    const cfg = loadConfig();
    const types = list(flags.types);
    for (const t of types) oneOf(t, TASK_TYPES, "types");
    const q = list(flags.paths).map(norm);
    const priors = loadPriors();
    const model = aliasOf(cfg.models?.implementer ?? DEFAULTS.models.implementer, cfg.prices);
    const judged = judgedRows(db, "implementer", types, []).filter((r) => r.first_pass !== null);
    const prior = (types.length ? types : ["*"]).map((t) => priorFor(priors, "implementer", t, model)).reduce((a, p) => ({ pass: a.pass + p.rate * p.n, n: a.n + p.n }), { pass: 0, n: 0 });
    const fpN = judged.length + prior.n;
    const fp = fpN ? (judged.filter((r) => r.first_pass).length + prior.pass) / fpN : 0.5;
    const reviewed = new Map();
    for (const g of db.prepare("SELECT g.feature_id, g.result, g.categories, f.files FROM gate_events g JOIN features f ON f.id=g.feature_id WHERE g.gate='review'").all()) {
      if (!touches(g.files, q)) continue;
      reviewed.set(g.feature_id, (reviewed.get(g.feature_id) ?? false) || g.result === "REQUEST_CHANGES" || list(g.categories).includes("auto-applied"));
    }
    const rc = reviewed.size ? [...reviewed.values()].filter(Boolean).length / reviewed.size : 0.5;
    const backlog = db.prepare("SELECT paths FROM backlog WHERE status='open' AND severity IN ('critical','high')").all().filter((b) => touches(b.paths, q)).length;
    const gotchas = db.prepare("SELECT paths FROM lessons WHERE kind='gotcha'").all().filter((l) => touches(l.paths, q)).length;
    // score = 1 − 0.45·(1−firstPass) − 0.25·reviewChangeRate − min(0.2, 0.1·openCritHighBacklog) − min(0.1, 0.05·gotchas)
    // unknown rates default to 0.5, so a repo with no evidence scores 0.65 (between askBelow and autoAt); every input only ever lowers the score
    const contributors = [
      { factor: "first-pass", penalty: 0.45 * (1 - fp), detail: `${types.join(",") || "any type"} ${fp.toFixed(2)}${judged.length ? ` (${judged.length} local)` : " (no local data)"}` },
      { factor: "review changes", penalty: 0.25 * rc, detail: reviewed.size ? `${[...reviewed.values()].filter(Boolean).length}/${reviewed.size} reviews on these paths needed changes` : "no reviews on these paths" },
      { factor: "backlog", penalty: Math.min(0.2, 0.1 * backlog), detail: `${backlog} open critical/high on these paths` },
      { factor: "gotchas", penalty: Math.min(0.1, 0.05 * gotchas), detail: `${gotchas} gotcha lesson${gotchas === 1 ? "" : "s"} on these paths` },
    ].sort((a, b) => b.penalty - a.penalty);
    const score = Math.max(0, Math.min(1, 1 - contributors.reduce((a, c) => a + c.penalty, 0)));
    const top = contributors.slice(0, 3).map((c) => ({ ...c, penalty: Math.round(c.penalty * 100) / 100 }));
    const band = score >= cfg.autonomy.autoAt ? "auto" : score < cfg.autonomy.askBelow ? "ask" : "normal";
    out([`confidence ${C.b}${score.toFixed(2)}${C.r} ${C.dim}(${band})${C.r}`, ...top.map((c) => `  ${C.rd}−${c.penalty.toFixed(2)}${C.r} ${c.factor.padEnd(14)} ${C.gy}${c.detail}${C.r}`)].join("\n"),
      { score: Math.round(score * 100) / 100, band, contributors: top });
  },

  dispatch(db) {
    if (sub === "start") {
      const feature = int(flags.feature, "feature"), iteration = int(flags.iteration, "iteration");
      const role = oneOf(flags.role, Object.keys(OUTCOMES), "role");
      if (typeof flags.model !== "string") die("--model required");
      const type = oneOf(flags.type ?? "other", TASK_TYPES, "type");
      const r = db.prepare("INSERT INTO dispatches (feature_id,iteration,role,model,unit,task_type,paths,started) VALUES (?,?,?,?,?,?,?,?)")
        .run(feature, iteration, role, flags.model, typeof flags.unit === "string" ? flags.unit : "", type, list(flags.paths).map(norm).join(","), now());
      const id = Number(r.lastInsertRowid);
      out(String(id), { id });
    } else if (sub === "finish") {
      const id = Number(rest[0]); if (!id) die("dispatch finish <id> --outcome O");
      const d = db.prepare("SELECT * FROM dispatches WHERE id=?").get(id); if (!d) die("no dispatch " + id);
      if (d.finished) die(`dispatch #${id} already finished`);
      const outcome = oneOf(flags.outcome, OUTCOMES[d.role], "outcome");
      const finished = now();
      const duration = optInt(flags.duration, "duration") ?? Math.round((Date.parse(finished) - Date.parse(d.started)) / 1000);
      db.prepare("UPDATE dispatches SET finished=?, duration_s=?, tokens=?, tool_uses=?, outcome=?, notes=? WHERE id=?")
        .run(finished, duration, optInt(flags.tokens, "tokens"), optInt(flags["tool-uses"], "tool-uses"), outcome, typeof flags.notes === "string" ? flags.notes : "", id);
      out(`dispatch #${id} ${outcome} · ${duration}s`, { id, outcome, duration_s: duration });
    } else if (sub === "list") {
      const rows = flags.feature ? db.prepare("SELECT * FROM dispatches WHERE feature_id=? ORDER BY id").all(int(flags.feature, "feature")) : db.prepare("SELECT * FROM dispatches ORDER BY id DESC LIMIT 50").all();
      out(rows.map((r) => `${C.b}#${r.id}${C.r} f${r.feature_id} it${r.iteration} ${C.bl}${r.role.padEnd(11)}${C.r} ${r.model.padEnd(7)} ${C.mg}${r.task_type.padEnd(10)}${C.r} ${(r.outcome ?? "…").padEnd(8)}${r.first_pass === null ? "" : r.first_pass ? ` ${C.gr}first-pass${C.r}` : ` ${C.rd}reworked${C.r}`}${r.tokens ? ` ${C.gy}${r.tokens} tok${C.r}` : ""} ${r.unit}`).join("\n") || "(none)", rows);
    } else if (sub === "mark-first-pass") {
      const feature = int(flags.feature, "feature"), iteration = int(flags.iteration, "iteration");
      const result = oneOf(flags.result, OUTCOMES.verifier, "result");
      const failed = list(flags["failed-paths"]).map(norm);
      const rows = db.prepare("SELECT id,paths FROM dispatches WHERE feature_id=? AND iteration=? AND role='implementer' AND first_pass IS NULL").all(feature, iteration);
      // INCONCLUSIVE, or FAILED with no attributable paths, can't say which unit broke: leave every row unmarked
      const marks = result === "PASSED" ? rows.map((r) => [r.id, 1]) : result === "FAILED" && failed.length ? rows.map((r) => [r.id, touches(r.paths, failed) ? 0 : 1]) : [];
      const upd = db.prepare("UPDATE dispatches SET first_pass=? WHERE id=?");
      for (const [id, v] of marks) upd.run(v, id);
      const pass = marks.filter(([, v]) => v).length;
      out(`marked ${marks.length} · ${pass} first-pass · ${marks.length - pass} reworked`, { marked: marks.length, firstPass: pass, reworked: marks.length - pass });
    } else die("dispatch start|finish|list|mark-first-pass");
  },

  gate(db) {
    if (sub !== "add") die("gate add --feature ID --iteration N --gate G --result R");
    const feature = int(flags.feature, "feature"), iteration = int(flags.iteration, "iteration");
    const gate = oneOf(flags.gate, Object.keys(GATE_ROLE), "gate");
    const result = oneOf(flags.result, OUTCOMES[GATE_ROLE[gate]], "result");
    const cats = list(flags.categories);
    for (const c of cats) oneOf(c, CATEGORIES, "categories");
    const r = db.prepare("INSERT INTO gate_events (feature_id,iteration,gate,result,finding_count,categories,created) VALUES (?,?,?,?,?,?,?)")
      .run(feature, iteration, gate, result, optInt(flags.count, "count") ?? 0, cats.join(","), now());
    const id = Number(r.lastInsertRowid);
    out(String(id), { id });
  },

  export(db, quiet = false) {
    const dump = {
      exported: now(),
      features: db.prepare("SELECT * FROM features ORDER BY id").all(),
      lessons: db.prepare("SELECT * FROM lessons ORDER BY id").all(),
      decisions: db.prepare("SELECT * FROM decisions ORDER BY id").all(),
      backlog: db.prepare("SELECT * FROM backlog ORDER BY id").all(),
      dispatches: db.prepare("SELECT * FROM dispatches ORDER BY id").all(),
      gate_events: db.prepare("SELECT * FROM gate_events ORDER BY id").all(),
    };
    const md = [];
    md.push("# foreman memory", "", `_Exported ${dump.exported}. Human-readable view; the JSON block at the end is the source of truth and rebuilds \`.foreman/memory.db\` on \`memory import\`._`, "");
    md.push("## Decisions"); for (const d of dump.decisions) md.push(`- ${d.confirmed ? "✅" : "〰️"} ${d.area ? `**${d.area}** · ` : ""}${d.text}`); if (!dump.decisions.length) md.push("- (none)");
    md.push("", "## Lessons"); for (const l of dump.lessons) md.push(`- **${l.kind}** ${l.text}${l.paths ? ` _(${l.paths})_` : ""}${l.feature_id ? ` — feature #${l.feature_id}` : ""}`); if (!dump.lessons.length) md.push("- (none)");
    md.push("", "## Backlog (open)"); const ob = dump.backlog.filter((b) => b.status === "open"); for (const b of ob) md.push(`- #${b.id} **${b.severity}** [${b.area}] ${b.title}${b.effort ? ` (${b.effort})` : ""}${b.plan ? ` — ${b.plan}` : ""}`); if (!ob.length) md.push("- (none)");
    const stats = featureStats(db, loadConfig().prices);
    md.push("", "## Features"); for (const f of [...dump.features].reverse()) { md.push(`- #${f.id} **${f.title}** [${f.outcome}] ${f.summary}${f.iterations ? ` · ${f.iterations} iterations` : ""}${f.flipped ? ` · flipped: ${f.flipped}` : ""}`); const sl = stats.has(f.id) && statLine(stats.get(f.id)); if (sl) md.push(`  - ${sl}`); } if (!dump.features.length) md.push("- (none)");
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
  db.exec("DELETE FROM features; DELETE FROM lessons; DELETE FROM decisions; DELETE FROM backlog; DELETE FROM dispatches; DELETE FROM gate_events; DELETE FROM fts;");
  const ins = (table, rows) => {
    for (const r of rows) {
      const cols = Object.keys(r); db.prepare(`INSERT INTO ${table} (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`).run(...cols.map((c) => r[c]));
    }
  };
  ins("features", dump.features ?? []); ins("lessons", dump.lessons ?? []); ins("decisions", dump.decisions ?? []); ins("backlog", dump.backlog ?? []); ins("dispatches", dump.dispatches ?? []); ins("gate_events", dump.gate_events ?? []);
  for (const f of dump.features ?? []) ftsUpsert(db, "feature", f.id, f.title, [f.summary, f.tags, f.flipped, f.review, f.security].filter(Boolean).join(" "), (f.files ?? "").replace(/,/g, " "));
  for (const l of dump.lessons ?? []) ftsUpsert(db, "lesson", l.id, l.kind, l.text, (l.paths ?? "").replace(/,/g, " "));
  for (const d of dump.decisions ?? []) ftsUpsert(db, "decision", d.id, d.area ?? "", d.text, "");
  for (const b of dump.backlog ?? []) ftsUpsert(db, "backlog", b.id, b.title, [b.area, b.severity, b.plan].filter(Boolean).join(" "), (b.paths ?? "").replace(/,/g, " "));
}

function summarizeCost(rows) {
  const c = { tokens: 0, cost: 0, currency: null, byRole: {}, byIteration: {}, top: null };
  const add = (o, k, r) => { o[k] ??= { tokens: 0, cost: 0 }; o[k].tokens += r.tokens ?? 0; o[k].cost += r.cost; };
  for (const r of rows.filter((r) => r.tokens)) {
    c.tokens += r.tokens; c.cost += r.cost; c.currency ??= r.currency;
    add(c.byRole, r.role, r); add(c.byIteration, r.iteration, r);
    if (!c.top || r.cost > c.top.cost || (r.cost === c.top.cost && r.tokens > c.top.tokens)) c.top = r;
  }
  return c;
}

function die(msg) { console.error("memory: " + msg); process.exit(1); }

if (!cmd || !commands[cmd]) {
  console.log(fs.readFileSync(new URL(import.meta.url)).toString().split("\n").filter((l) => l.startsWith("//")).map((l) => l.slice(3)).join("\n"));
  process.exit(cmd ? 1 : 0);
}
const db = openDb();
try { commands[cmd](db); } finally { db.close(); }
