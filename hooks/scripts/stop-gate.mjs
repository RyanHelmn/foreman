// foreman Stop gate logic. Input JSON in FOREMAN_HOOK_INPUT (or stdin when run directly).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { loadConfig, writeSafe } from "../../scripts/lib/util.mjs";

const PASSING = { verify: ["PASSED"], review: ["APPROVE"], security: ["PASS", "PASS_WITH_FINDINGS"] };

export function logged(dir, featureId) {
  const file = path.join(dir, "memory.db");
  if (featureId == null || !fs.existsSync(file)) return null;
  const db = new DatabaseSync(file, { readOnly: true });
  const rows = db.prepare("SELECT gate, result FROM gate_events WHERE feature_id=?").all(featureId);
  db.close();
  return new Set(rows.filter((r) => PASSING[r.gate]?.includes(r.result)).map((r) => r.gate));
}

const WAIT_MS = 30 * 60e3;

export function running(dir, featureId, now = Date.now()) {
  const file = path.join(dir, "memory.db");
  if (featureId == null || !fs.existsSync(file)) return 0;
  const db = new DatabaseSync(file, { readOnly: true });
  const rows = db.prepare("SELECT started FROM dispatches WHERE feature_id=? AND finished IS NULL AND agent_id IS NOT NULL").all(featureId);
  db.close();
  return rows.filter((r) => now - Date.parse(r.started) < WAIT_MS).length;
}

const clean = (s) => String(s ?? "").replace(/[\x00-\x1f\x7f]/g, " ").slice(0, 80);

export function decide(input, run, cfg, now = Date.now(), logged = null, running = 0) {
  if (!run || !run.active || running) return null;
  const g = cfg?.gates || {};
  const enforce = g.enforce !== false;
  const maxBlocks = Number.isInteger(g.maxBlocks) ? g.maxBlocks : 3;
  const staleHours = typeof g.staleHours === "number" ? g.staleHours : 6;
  const pending = [];
  if (Array.isArray(run.changedFiles) && run.changedFiles.length) {
    for (const k of ["verify", "review", "security"]) if (run.gates?.[k] !== "passed" || (logged && !logged.has(k))) pending.push(k);
  }
  if (!pending.length) return null;
  const ageH = run.started ? (now - Date.parse(run.started)) / 36e5 : Infinity;
  const session = input.session_id;
  const foreign = run.sessionId && session && run.sessionId !== session;
  if (foreign || !(ageH <= staleHours)) {
    return { write: null, out: { systemMessage: `foreman: a feature run ("${clean(run.task)}") is still marked active in .foreman/run.json from ${foreign ? "another session" : Number.isFinite(ageH) ? `${Math.round(ageH)}h ago` : "an unknown time"}; not enforcing its gates here. If it is abandoned, set active=false (or run /foreman:feature to resume it).` } };
  }
  const next = { ...run, blockCount: (run.blockCount || 0) + 1, sessionId: run.sessionId || session };
  const reason = `foreman: feature run #${Number(run.featureId) || "?"} is active with gates pending: ${pending.join(", ")}. Finish the pending gates (verifier -> reviewer -> security-auditor), log each verdict with "memory.mjs gate add" (a gate only counts once its passing verdict is logged), set them to "passed" in .foreman/run.json, then set active=false. If you must stop early, set active=false and tell the user which gates were skipped.`;
  if (!enforce) return { write: next, out: { systemMessage: "Reminder: " + reason } };
  if (next.blockCount > maxBlocks) return { write: next, out: { systemMessage: `foreman: gate block limit (${maxBlocks}) reached; allowing stop. Pending: ${pending.join(", ")}. Tell the user.` } };
  return { write: next, out: { decision: "block", reason } };
}

const isMain = process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]));
if (isMain) {
  let raw = process.env.FOREMAN_HOOK_INPUT;
  if (raw === undefined) { try { raw = fs.readFileSync(0, "utf8"); } catch { raw = ""; } }
  let input = {}; try { input = JSON.parse(raw || "{}"); } catch {}
  const cwd = input.cwd || process.cwd();
  const dir = path.join(cwd, ".foreman");
  const read = (f) => { try { return JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); } catch { return null; } };
  let run = read("run.json");
  if (run?.active) { try { execFileSync("git", ["ls-files", "--error-unmatch", ".foreman/run.json"], { cwd, stdio: "ignore" }); run = null; } catch {} }
  let seen = null, busy = 0; try { if (run) { seen = logged(dir, run.featureId); busy = running(dir, run.featureId); } } catch {}
  let cfg = null; try { cfg = loadConfig(dir); } catch {}
  const r = run ? decide(input, run, cfg, Date.now(), seen, busy) : null;
  if (r) {
    if (r.write) { try { writeSafe(path.join(dir, "run.json"), JSON.stringify(r.write, null, 2)); } catch {} }
    process.stdout.write(JSON.stringify(r.out));
  }
}
