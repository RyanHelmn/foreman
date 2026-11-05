#!/usr/bin/env bash
# foreman Stop gate.
# Reads the Stop hook payload on stdin, looks for <cwd>/.foreman/run.json.
# If an orchestration run is active and a gate is still pending, block the stop
# (bounded by gates.maxBlocks from .foreman/config.json, default 3) so the lead
# finishes verify -> review -> security instead of declaring done early.
# Costs no tokens: pure shell + node/python JSON parsing. Fails open on any error.

set -u
INPUT="$(cat 2>/dev/null || true)"

# Pick a JSON runtime. Prefer node (JS projects), fall back to python3, else allow.
if command -v node >/dev/null 2>&1; then
  RUNTIME=node
elif command -v python3 >/dev/null 2>&1; then
  RUNTIME=python3
else
  exit 0
fi

if [ "$RUNTIME" = node ]; then
  printf '%s' "$INPUT" | node -e '
let raw = ""; process.stdin.on("data", d => raw += d).on("end", () => {
  const fs = require("fs"), path = require("path");
  let input = {}; try { input = JSON.parse(raw || "{}"); } catch {}
  const cwd = input.cwd || process.cwd();
  const runPath = path.join(cwd, ".foreman", "run.json");
  const cfgPath = path.join(cwd, ".foreman", "config.json");
  if (!fs.existsSync(runPath)) return;
  let run, cfg = {};
  try { run = JSON.parse(fs.readFileSync(runPath, "utf8")); } catch { return; }
  try { cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8")); } catch {}
  const gatesCfg = (cfg.gates || {});
  const enforce = gatesCfg.enforce !== false;
  const maxBlocks = Number.isInteger(gatesCfg.maxBlocks) ? gatesCfg.maxBlocks : 3;
  if (!run.active) return;
  const g = run.gates || {};
  const changed = Array.isArray(run.changedFiles) && run.changedFiles.length > 0;
  const pending = [];
  if (changed) {
    if (g.verify !== "passed") pending.push("verify");
    if (g.review !== "passed") pending.push("review");
    if (g.security !== "passed") pending.push("security");
  }
  if (pending.length === 0) return;
  const blockCount = (run.blockCount || 0) + 1;
  run.blockCount = blockCount;
  try { fs.writeFileSync(runPath, JSON.stringify(run, null, 2)); } catch {}
  const reason = `foreman: run "${run.task || ""}" is active with gates pending: ${pending.join(", ")}. ` +
    `Finish the pending gates (verifier -> reviewer -> security-auditor), set them to "passed" in .foreman/run.json, ` +
    `then set active=false. If you must stop early, set active=false and tell the user which gates were skipped.`;
  if (!enforce) { process.stdout.write(JSON.stringify({ systemMessage: "Reminder: " + reason })); return; }
  if (blockCount > maxBlocks) {
    process.stdout.write(JSON.stringify({ systemMessage: `foreman: gate block limit (${maxBlocks}) reached; allowing stop. Pending: ${pending.join(", ")}. Tell the user.` }));
    return;
  }
  process.stdout.write(JSON.stringify({ decision: "block", reason }));
});'
else
  FOREMAN_HOOK_INPUT="$INPUT" python3 - <<'PY'
import json, os, sys
try:
    inp = json.loads(os.environ.get("FOREMAN_HOOK_INPUT") or "{}")
except Exception:
    inp = {}
cwd = inp.get("cwd") or os.getcwd()
run_path = os.path.join(cwd, ".foreman", "run.json")
cfg_path = os.path.join(cwd, ".foreman", "config.json")
if not os.path.exists(run_path):
    sys.exit(0)
try:
    run = json.load(open(run_path))
except Exception:
    sys.exit(0)
cfg = {}
try:
    cfg = json.load(open(cfg_path))
except Exception:
    pass
gates_cfg = cfg.get("gates", {}) or {}
enforce = gates_cfg.get("enforce", True) is not False
max_blocks = gates_cfg.get("maxBlocks", 3)
if not run.get("active"):
    sys.exit(0)
g = run.get("gates", {}) or {}
changed = bool(run.get("changedFiles"))
pending = []
if changed:
    for k in ("verify", "review", "security"):
        if g.get(k) != "passed":
            pending.append(k)
if not pending:
    sys.exit(0)
run["blockCount"] = int(run.get("blockCount", 0)) + 1
try:
    json.dump(run, open(run_path, "w"), indent=2)
except Exception:
    pass
reason = (f'foreman: run "{run.get("task","")}" is active with gates pending: {", ".join(pending)}. '
          'Finish the pending gates (verifier -> reviewer -> security-auditor), set them to "passed" in '
          '.foreman/run.json, then set active=false. If you must stop early, set active=false and tell the user which gates were skipped.')
if not enforce:
    print(json.dumps({"systemMessage": "Reminder: " + reason})); sys.exit(0)
if run["blockCount"] > max_blocks:
    print(json.dumps({"systemMessage": f"foreman: gate block limit ({max_blocks}) reached; allowing stop. Pending: {', '.join(pending)}. Tell the user."})); sys.exit(0)
print(json.dumps({"decision": "block", "reason": reason}))
PY
fi
exit 0
