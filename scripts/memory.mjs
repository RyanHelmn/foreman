#!/usr/bin/env node
// foreman memory — a single-file SQLite store (.foreman/memory.db) with full-text search.
// Zero dependencies: uses Node's built-in node:sqlite (Node >= 22.13). Logic lives in scripts/lib/.
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
//   lesson delete   <id>                     a pack gotcha deleted here is never re-imported
//   decision add    --text T [--source user|docs|inferred] [--confirmed 0|1] [--area A]
//   decision list
//   backlog add     --title T --area security|performance|architecture|testing|dx|deps|product|other --severity critical|high|medium|low [--plan P] [--effort s|m|l] [--paths ...]
//   backlog list    [--status open|done|dismissed|all]
//   backlog update  <id> --status open|done|dismissed [--feature ID]
//   recall          <query> [--limit N]      full-text search across everything
//   relevant        [--paths p1,p2] [--text "..."] [--limit N]   lessons+decisions for a brief
//   dispatch start  --feature ID --iteration N --role R --model M [--unit U] [--type T] [--paths ...] [--agent ID]   -> prints id
//   dispatch finish <id> | --agent ID   --outcome O [--tokens N] [--tool-uses N] [--duration S] [--notes ...]
//   dispatch list   [--feature ID]
//   dispatch mark-first-pass --feature ID --iteration N --result PASSED|FAILED|INCONCLUSIVE [--failed-paths p1,p2]
//   gate add        --feature ID --iteration N --gate verify|review|security --result R [--count N] [--categories ...]
//   cost            <feature_id>             tokens and estimated cost by role and iteration
//   feature report  <id> [--json]            write .foreman/reports/<id>.md
//   routing         [--type T] [--paths P]   first-pass evidence per task type × model
//   routing suggest --role implementer --type T [--paths P] [--no-explore]   cheapest model with enough evidence
//   confidence      --types T,T --paths P    0–1 score for running a task unattended, with its top 3 contributors
//   export                                  write .foreman/MEMORY.md (human-readable + JSON snapshot)
//   import                                  rebuild db from .foreman/MEMORY.md
//
// Output is plain text unless --json is passed.

import fs from "node:fs";
import path from "node:path";
import { openDb } from "./lib/db.mjs";
import * as ev from "./lib/evidence.mjs";
import { exportMd, importFromMd } from "./lib/export.mjs";
import * as ft from "./lib/features.mjs";
import * as mi from "./lib/memory-items.mjs";
import { fail, ktok, list, loadConfig, money } from "./lib/util.mjs";

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
const cfg = () => loadConfig(DIR);
const TTY = process.stdout.isTTY && !flags["no-color"] && !process.env.NO_COLOR;
const C = TTY ? { r: "\x1b[0m", b: "\x1b[1m", dim: "\x1b[2m", am: "\x1b[38;5;214m", gr: "\x1b[38;5;114m", rd: "\x1b[38;5;203m", bl: "\x1b[38;5;75m", gy: "\x1b[38;5;245m", mg: "\x1b[38;5;176m" }
  : { r: "", b: "", dim: "", am: "", gr: "", rd: "", bl: "", gy: "", mg: "" };
const sev = (v) => ({ critical: C.rd + C.b, high: C.rd, medium: C.am, low: C.gy }[v] ?? "") + v + C.r;
const st = (v) => v === "done" || v === "passed" ? C.gr + "●" + C.r : v === "in_progress" || v === "open" ? C.am + "◐" + C.r : v === "abandoned" || v === "failed" ? C.rd + "✕" + C.r : C.gy + "○" + C.r;
const out = (text, obj) => console.log(flags.json ? JSON.stringify(obj ?? text, null, 2) : text);
const id = (s) => out(String(s.id), s);
const pct = (v) => (v === null ? "—" : Math.round(v * 100) + "%");

const commands = {
  init: () => out(`memory ready: ${path.relative(ROOT, path.join(DIR, "memory.db"))}`, { db: path.join(DIR, "memory.db") }),

  stats(db) { const s = ft.stats(db); out(Object.entries(s).map(([k, v]) => `${k}: ${v}`).join("\n"), s); },

  briefing(db) {
    const { data: d, evidence } = ft.briefing(db, cfg());
    const lines = [`${C.am}${C.b}⚒ foreman${C.r} ${C.gy}·${C.r} ${path.basename(ROOT)}`];
    if (d.inprog) lines.push(`  ${C.dim}in progress${C.r}  #${d.inprog.id} ${d.inprog.title}`);
    if (d.feats.length) lines.push(`  ${C.dim}recent${C.r}       ` + d.feats.filter((f) => f.outcome !== "in_progress").map((f) => `#${f.id} ${st(f.outcome)} ${f.title}`).join(" · "));
    lines.push(`  ${C.dim}backlog${C.r}      ${d.open} open (${d.crit} critical/high) · lessons ${d.lessons}`);
    for (const l of d.recentLessons) lines.push(`  ${C.gy}·${C.r} ${C.mg}${l.kind.padEnd(10)}${C.r} ${l.text.slice(0, 100)}`);
    if (evidence >= 10) lines.push(`  ${C.dim}evidence${C.r}     ${evidence} features with dispatches · routing could use it: /foreman:config routing=evidence`);
    lines.push(`  ${C.gy}/foreman:feature · /foreman:review · /foreman:recall · /foreman:map${C.r}`);
    out(lines.join("\n"), d);
  },

  feature(db) {
    if (sub === "start") return id(ft.featureStart(db, flags));
    if (sub === "finish") { const r = ft.featureFinish(db, DIR, cfg(), Number(rest[0]), flags); return out(`feature #${r.id} ${r.outcome}`, r); }
    if (sub === "list") {
      const { rows, showCost, currency } = ft.featureList(db, cfg(), Number(flags.limit ?? 20));
      return out(rows.map((r) => `${st(r.outcome)} ${C.b}#${r.id}${C.r} ${r.title}${r.iterations ? ` ${C.dim}(${r.iterations} it.)${C.r}` : ""}${showCost && r.tokens ? ` ${C.am}${money(r.cost, currency)}${C.r}` : ""} ${C.gy}${(r.finished ?? r.started).slice(0, 10)}${C.r}`).join("\n") || "(none)", rows);
    }
    if (sub === "show") {
      const f = ft.featureShow(db, Number(rest[0]));
      return out([`#${f.id} ${f.title} [${f.outcome}]`, f.summary, `files: ${f.files}`, `iterations: ${f.iterations}  flipped: ${f.flipped}`, `review: ${f.review}`, `security: ${f.security}`, ...f.lessons.map((l) => `· ${l.kind}: ${l.text}`)].filter(Boolean).join("\n"), f);
    }
    if (sub === "report") { const r = ft.featureReport(db, DIR, cfg(), Number(rest[0])); return out(path.relative(ROOT, r.path), r); }
    fail("feature start|finish|list|show|report");
  },

  lesson(db) {
    if (sub === "add") return id(mi.lessonAdd(db, flags));
    if (sub === "delete") { const r = mi.lessonDelete(db, Number(rest[0])); exportMd(db, DIR, cfg().prices); return out(`lesson #${r.id} deleted`, r); }
    if (sub !== "list") fail("lesson add|list|delete");
    const rows = mi.lessonList(db, Number(flags.limit ?? 30));
    out(rows.map((r) => `${C.b}#${r.id}${C.r} ${C.mg}${r.kind}${C.r} ${r.text}${r.paths ? ` ${C.gy}(${r.paths})${C.r}` : ""}${r.source ? ` ${C.dim}${r.source}${C.r}` : ""}`).join("\n") || "(none)", rows);
  },

  decision(db) {
    if (sub === "add") return id(mi.decisionAdd(db, flags));
    if (sub !== "list") fail("decision add|list");
    const rows = mi.decisionList(db);
    out(rows.map((r) => `${C.b}#${r.id}${C.r} ${r.confirmed ? C.gr + "confirmed" : C.gy + "inferred"}${C.r}${r.area ? ` ${C.bl}${r.area}${C.r}` : ""} ${r.text}`).join("\n") || "(none)", rows);
  },

  backlog(db) {
    if (sub === "add") return id(mi.backlogAdd(db, flags));
    if (sub === "update") { const r = mi.backlogUpdate(db, DIR, cfg().prices, Number(rest[0]), flags); return out(`backlog #${r.id} ${r.status}`, r); }
    if (sub !== "list") fail("backlog add|list|update");
    const rows = mi.backlogList(db, flags.status ?? "open");
    out((rows.length ? [`${C.dim}#    sev       area           eff  title${C.r}`] : []).concat(rows.map((r) => `${String(r.id).padEnd(4)} ${sev(r.severity).padEnd(9 + (sev(r.severity).length - r.severity.length))} ${C.bl}${r.area.padEnd(14)}${C.r} ${(r.effort || "-").padEnd(4)} ${r.title}${r.status !== "open" ? ` ${C.gy}— ${r.status}${C.r}` : ""}`)).join("\n") || "(none)", rows);
  },

  recall(db) {
    const rows = mi.recall(db, [sub, ...rest].filter(Boolean).join(" "), Number(flags.limit ?? 12));
    out(rows.map((r) => `${C.bl}${r.kind.padEnd(8)}${C.r} ${C.b}#${r.ref_id}${C.r} ${r.title ? r.title + ": " : ""}${r.snip.replace(/\[/g, C.am).replace(/\]/g, C.r)}`).join("\n") || "(no matches)", rows);
  },

  relevant(db) {
    const top = mi.relevant(db, { paths: list(flags.paths), text: flags.text ?? "", limit: Number(flags.limit ?? 10) });
    out(top.map((h) => `${h.kind} #${h.id}: ${h.line}`).join("\n") || "(nothing relevant yet)", top);
  },

  cost(db) {
    const f = db.prepare("SELECT id,title FROM features WHERE id=?").get(Number(sub)) ?? fail("cost <feature_id>");
    const c = ev.featureCost(db, f.id, cfg().prices);
    if (!c.tokens) return out(`#${f.id} no token counts recorded`, c);
    const part = (o) => Object.entries(o).map(([k, v]) => `${k} ${ktok(v.tokens)} ${money(v.cost, c.currency)}`).join(" · ");
    out([`${C.b}#${f.id}${C.r} ${f.title} · ${ktok(c.tokens)} tok · ${C.am}${money(c.cost, c.currency)}${C.r} est.`,
      `  ${C.dim}by role${C.r}       ${part(c.byRole)}`, `  ${C.dim}by iteration${C.r}  ${part(Object.fromEntries(Object.entries(c.byIteration).map(([k, v]) => ["it" + k, v])))}`,
      `  ${C.dim}priciest${C.r}      #${c.top.id} ${c.top.role} ${c.top.model}${c.top.unit ? ` ${c.top.unit}` : ""} ${ktok(c.top.tokens)} ${money(c.top.cost, c.currency)}`].join("\n"), c);
  },

  routing(db) {
    const q = { types: list(flags.type), paths: list(flags.paths) };
    if (sub === "suggest") { const r = ev.routingSuggest(db, cfg(), { ...q, role: flags.role ?? "implementer", noExplore: !!flags["no-explore"] }); return out(`${r.role}: ${r.model} (${r.basis})`, r); }
    if (sub) fail("routing [--type T] [--paths P] | routing suggest --role R --type T");
    const rows = ev.routingTable(db, cfg(), q);
    out((rows.length ? [`${C.dim}type        model    n    first-pass  iter  tokens${C.r}`] : []).concat(rows.map((r) =>
      `${C.mg}${r.type.padEnd(11)}${C.r} ${r.model.padEnd(8)} ${String(r.dispatches).padEnd(4)} ${(pct(r.firstPassRate) + (r.judged ? ` ${Math.round(r.firstPassRate * r.judged)}/${r.judged}` : "")).padEnd(11)} ${(r.meanIterations === null ? "—" : r.meanIterations.toFixed(1)).padEnd(5)} ${r.meanTokens === null ? "—" : ktok(Math.round(r.meanTokens))}${r.unattributed ? ` ${C.gy}${r.unattributed} unattributed${C.r}` : ""}${r.judged < 10 ? ` ${C.gy}(small n)${C.r}` : ""}`)).join("\n") || "(no implementer dispatches yet)", rows);
  },

  confidence(db) {
    const r = ev.confidence(db, cfg(), { types: list(flags.types), paths: list(flags.paths) });
    out([`confidence ${C.b}${r.score.toFixed(2)}${C.r} ${C.dim}(${r.band})${C.r}`, ...r.contributors.map((c) => `  ${C.rd}−${c.penalty.toFixed(2)}${C.r} ${c.factor.padEnd(14)} ${C.gy}${c.detail}${C.r}`)].join("\n"), r);
  },

  dispatch(db) {
    if (sub === "start") return id(ev.dispatchStart(db, flags));
    if (sub === "finish") {
      if (!flags.agent && !Number(rest[0])) fail("dispatch finish <id> --outcome O");
      const r = ev.dispatchFinish(db, { ...flags, id: Number(rest[0]), toolUses: flags["tool-uses"] });
      return out(`dispatch #${r.id} ${r.outcome} · ${r.duration_s}s`, r);
    }
    if (sub === "list") {
      const rows = ev.dispatchList(db, flags.feature);
      return out(rows.map((r) => `${C.b}#${r.id}${C.r} f${r.feature_id} it${r.iteration} ${C.bl}${r.role.padEnd(11)}${C.r} ${r.model.padEnd(7)} ${C.mg}${r.task_type.padEnd(10)}${C.r} ${(r.outcome ?? "…").padEnd(9)}${r.first_pass === null ? (r.unattributed ? ` ${C.gy}unattributed${C.r}` : "") : r.first_pass ? ` ${C.gr}first-pass${C.r}` : ` ${C.rd}reworked${C.r}`}${r.tokens ? ` ${C.gy}${r.tokens} tok${C.r}` : ""} ${C.dim}${r.source ?? "lead"}${C.r} ${r.unit}`).join("\n") || "(none)", rows);
    }
    if (sub === "mark-first-pass") {
      const r = ev.markFirstPass(db, { ...flags, failedPaths: flags["failed-paths"] });
      return out(`marked ${r.marked} · ${r.firstPass} first-pass · ${r.reworked} reworked${r.unattributed ? ` · ${r.unattributed} unattributed` : ""}`, r);
    }
    fail("dispatch start|finish|list|mark-first-pass");
  },

  gate(db) {
    if (sub !== "add") fail("gate add --feature ID --iteration N --gate G --result R");
    id(ev.gateAdd(db, flags));
  },

  export(db) { const f = exportMd(db, DIR, cfg().prices); out(`exported ${path.relative(ROOT, f)}`, { path: f }); },

  import(db) { importFromMd(db, DIR); out("imported from MEMORY.md"); },
};

if (!cmd || !commands[cmd]) {
  console.log(fs.readFileSync(new URL(import.meta.url)).toString().split("\n").filter((l) => l.startsWith("//")).map((l) => l.slice(3)).join("\n"));
  process.exit(cmd ? 1 : 0);
}
const db = openDb(DIR);
try { commands[cmd](db); } catch (e) { console.error("memory: " + e.message); process.exitCode = 1; } finally { db.close(); }
