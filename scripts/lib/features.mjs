import fs from "node:fs";
import path from "node:path";
import { ftsUpsert } from "./db.mjs";
import { costRows, featureStats, summarizeCost } from "./evidence.mjs";
import { exportMd } from "./export.mjs";
import { fail, ktok, list, money, now } from "./util.mjs";

export function stats(db) {
  const c = (t, w = "") => db.prepare(`SELECT COUNT(*) n FROM ${t} ${w}`).get().n;
  return { features: c("features"), done: c("features", "WHERE outcome='done'"), lessons: c("lessons"), decisions: c("decisions"), backlogOpen: c("backlog", "WHERE status='open'") };
}

export function briefing(db, cfg) {
  const data = {
    inprog: db.prepare("SELECT id,title FROM features WHERE outcome='in_progress' ORDER BY id DESC LIMIT 1").get(),
    feats: db.prepare("SELECT id,title,outcome,finished,started FROM features ORDER BY id DESC LIMIT 3").all(),
    open: db.prepare("SELECT COUNT(*) n FROM backlog WHERE status='open'").get().n,
    crit: db.prepare("SELECT COUNT(*) n FROM backlog WHERE status='open' AND severity IN ('critical','high')").get().n,
    lessons: db.prepare("SELECT COUNT(*) n FROM lessons").get().n,
    recentLessons: db.prepare("SELECT kind,text FROM lessons ORDER BY id DESC LIMIT 3").all(),
  };
  const evidence = cfg.routing.mode === "static"
    ? db.prepare("SELECT COUNT(DISTINCT f.id) n FROM features f JOIN dispatches d ON d.feature_id=f.id WHERE f.outcome!='in_progress'").get().n
    : 0;
  return { data, evidence };
}

export function featureStart(db, a) {
  if (!a.title || a.title === true) fail("--title required");
  const r = db.prepare("INSERT INTO features (title,summary,tags,files,started) VALUES (?,?,?,?,?)").run(a.title, a.summary ?? "", list(a.tags).join(","), list(a.files).join(","), now());
  const id = Number(r.lastInsertRowid);
  ftsUpsert(db, "feature", id, a.title, [a.summary, a.tags].filter(Boolean).join(" "), list(a.files).join(" "));
  return { id };
}

export function featureFinish(db, dir, cfg, id, a) {
  if (!id) fail("feature finish <id>");
  const f = db.prepare("SELECT * FROM features WHERE id=?").get(id) ?? fail("no feature " + id);
  const files = list(a.files).length ? list(a.files).join(",") : f.files;
  const outcome = a.outcome ?? "done";
  db.prepare("UPDATE features SET outcome=?, summary=?, files=?, iterations=?, flipped=?, review=?, security=?, finished=? WHERE id=?")
    .run(outcome, a.summary ?? f.summary, files, Number(a.iterations ?? f.iterations), a.flipped ?? f.flipped, a.review ?? f.review, a.security ?? f.security, now(), id);
  ftsUpsert(db, "feature", id, f.title, [a.summary ?? f.summary, f.tags, a.flipped, a.review, a.security].filter(Boolean).join(" "), files.replace(/,/g, " "));
  exportMd(db, dir, cfg.prices);
  return { id, outcome };
}

export function featureList(db, cfg, limit) {
  const stats = featureStats(db, cfg.prices);
  const showCost = [...stats.values()].some((s) => s.tokens);
  const rows = db.prepare("SELECT id,title,outcome,iterations,started,finished FROM features ORDER BY id DESC LIMIT ?").all(limit)
    .map((r) => (showCost ? { ...r, tokens: stats.get(r.id)?.tokens ?? 0, cost: stats.get(r.id)?.cost ?? 0 } : r));
  return { rows, showCost, currency: [...stats.values()].find((s) => s.currency)?.currency };
}

export function featureShow(db, id) {
  const f = db.prepare("SELECT * FROM features WHERE id=?").get(id) ?? fail("no feature " + id);
  return { ...f, lessons: db.prepare("SELECT kind,text,paths FROM lessons WHERE feature_id=?").all(id) };
}

export function featureReport(db, dir, cfg, id) {
  const f = db.prepare("SELECT * FROM features WHERE id=?").get(id) ?? fail("feature report <id>");
  const ds = costRows(db.prepare("SELECT * FROM dispatches WHERE feature_id=? ORDER BY id").all(id), cfg.prices);
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
  const rp = path.join(dir, "reports", `${id}.md`);
  fs.mkdirSync(path.dirname(rp), { recursive: true });
  fs.writeFileSync(rp, md.join("\n"));
  return { path: rp, feature: f, units, gates, lessons, cost: c };
}
