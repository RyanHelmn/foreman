// foreman Stop gate logic. Input JSON in FOREMAN_HOOK_INPUT (or stdin when run directly).
import fs from "node:fs";
import path from "node:path";

export function decide(input, run, cfg, now = Date.now()) {
  if (!run || !run.active) return null;
  const g = cfg?.gates || {};
  const enforce = g.enforce !== false;
  const maxBlocks = Number.isInteger(g.maxBlocks) ? g.maxBlocks : 3;
  const staleHours = typeof g.staleHours === "number" ? g.staleHours : 6;
  const pending = [];
  if (Array.isArray(run.changedFiles) && run.changedFiles.length) {
    for (const k of ["verify", "review", "security"]) if (run.gates?.[k] !== "passed") pending.push(k);
  }
  if (!pending.length) return null;
  const ageH = run.started ? (now - Date.parse(run.started)) / 36e5 : 0;
  const session = input.session_id;
  const foreign = run.sessionId && session && run.sessionId !== session;
  if (foreign || (Number.isFinite(ageH) && ageH > staleHours)) {
    return { write: null, out: { systemMessage: `foreman: a feature run ("${run.task || ""}") is still marked active in .foreman/run.json from ${foreign ? "another session" : `${Math.round(ageH)}h ago`}; not enforcing its gates here. If it is abandoned, set active=false (or run /foreman:feature to resume it).` } };
  }
  const next = { ...run, blockCount: (run.blockCount || 0) + 1, sessionId: run.sessionId || session };
  const reason = `foreman: run "${run.task || ""}" is active with gates pending: ${pending.join(", ")}. Finish the pending gates (verifier -> reviewer -> security-auditor), set them to "passed" in .foreman/run.json, then set active=false. If you must stop early, set active=false and tell the user which gates were skipped.`;
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
  const run = read("run.json");
  const r = run ? decide(input, run, read("config.json")) : null;
  if (r) {
    if (r.write) { try { fs.writeFileSync(path.join(dir, "run.json"), JSON.stringify(r.write, null, 2)); } catch {} }
    process.stdout.write(JSON.stringify(r.out));
  }
}
