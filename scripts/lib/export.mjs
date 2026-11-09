import fs from "node:fs";
import path from "node:path";
import { ftsUpsert } from "./db.mjs";
import { featureStats, statLine } from "./evidence.mjs";
import { now } from "./util.mjs";

const TABLES = ["features", "lessons", "decisions", "backlog", "dispatches", "gate_events"];

export function exportMd(db, dir, prices) {
  const dump = { exported: now() };
  for (const t of TABLES) dump[t] = db.prepare(`SELECT * FROM ${t} ORDER BY id`).all();
  const md = [];
  md.push("# foreman memory", "", `_Exported ${dump.exported}. Human-readable view; the JSON block at the end is the source of truth and rebuilds \`.foreman/memory.db\` on \`memory import\`._`, "");
  md.push("## Decisions"); for (const d of dump.decisions) md.push(`- ${d.confirmed ? "✅" : "〰️"} ${d.area ? `**${d.area}** · ` : ""}${d.text}`); if (!dump.decisions.length) md.push("- (none)");
  md.push("", "## Lessons"); for (const l of dump.lessons) md.push(`- **${l.kind}** ${l.text}${l.paths ? ` _(${l.paths})_` : ""}${l.feature_id ? ` — feature #${l.feature_id}` : ""}`); if (!dump.lessons.length) md.push("- (none)");
  md.push("", "## Backlog (open)"); const ob = dump.backlog.filter((b) => b.status === "open"); for (const b of ob) md.push(`- #${b.id} **${b.severity}** [${b.area}] ${b.title}${b.effort ? ` (${b.effort})` : ""}${b.plan ? ` — ${b.plan}` : ""}`); if (!ob.length) md.push("- (none)");
  const stats = featureStats(db, prices);
  md.push("", "## Features"); for (const f of [...dump.features].reverse()) { md.push(`- #${f.id} **${f.title}** [${f.outcome}] ${f.summary}${f.iterations ? ` · ${f.iterations} iterations` : ""}${f.flipped ? ` · flipped: ${f.flipped}` : ""}`); const sl = stats.has(f.id) && statLine(stats.get(f.id)); if (sl) md.push(`  - ${sl}`); } if (!dump.features.length) md.push("- (none)");
  md.push("", "<!-- foreman:snapshot -->", "```json", JSON.stringify(dump, null, 1), "```", "");
  const file = path.join(dir, "MEMORY.md");
  fs.writeFileSync(file, md.join("\n"));
  return file;
}

export function importFromMd(db, dir) {
  const file = path.join(dir, "MEMORY.md");
  if (!fs.existsSync(file)) return;
  const m = fs.readFileSync(file, "utf8").match(/<!-- foreman:snapshot -->\s*```json\s*([\s\S]*?)```/);
  if (!m) return;
  let dump; try { dump = JSON.parse(m[1]); } catch { return; }
  db.exec(TABLES.map((t) => `DELETE FROM ${t};`).join(" ") + " DELETE FROM fts;");
  for (const table of TABLES)
    for (const r of dump[table] ?? []) {
      const cols = Object.keys(r);
      db.prepare(`INSERT INTO ${table} (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`).run(...cols.map((c) => r[c]));
    }
  for (const f of dump.features ?? []) ftsUpsert(db, "feature", f.id, f.title, [f.summary, f.tags, f.flipped, f.review, f.security].filter(Boolean).join(" "), (f.files ?? "").replace(/,/g, " "));
  for (const l of dump.lessons ?? []) ftsUpsert(db, "lesson", l.id, l.kind, l.text, (l.paths ?? "").replace(/,/g, " "));
  for (const d of dump.decisions ?? []) ftsUpsert(db, "decision", d.id, d.area ?? "", d.text, "");
  for (const b of dump.backlog ?? []) ftsUpsert(db, "backlog", b.id, b.title, [b.area, b.severity, b.plan].filter(Boolean).join(" "), (b.paths ?? "").replace(/,/g, " "));
}
