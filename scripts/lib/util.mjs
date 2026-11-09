import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const TASK_TYPES = ["api", "data-model", "migration", "ui", "auth", "test", "refactor", "config", "infra", "docs", "other"];
export const MOD_OUTCOMES = ["completed", "failed", "killed"];
export const OUTCOMES = { scout: ["DONE"], implementer: ["DONE", "PARTIAL", "BLOCKED"], verifier: ["PASSED", "FAILED", "INCONCLUSIVE"], reviewer: ["APPROVE", "REQUEST_CHANGES"], security: ["PASS", "PASS_WITH_FINDINGS", "FAIL"] };
export const GATE_ROLE = { verify: "verifier", review: "reviewer", security: "security" };
export const CATEGORIES = ["type-error", "test-fail", "lint", "convention", "correctness", "design", "security-high", "security-medium", "security-low", "flaky", "env", "auto-applied"];
export const NEVER_EXPLORE = ["auth", "migration", "data-model", "infra"];

export const DEFAULTS = {
  // placeholder blended rates in GBP; edit to match your plan — estimates only
  prices: { haiku: { perMTok: 0.15, currency: "GBP" }, sonnet: { perMTok: 2.8, currency: "GBP" }, opus: { perMTok: 5.6, currency: "GBP" }, fable: { perMTok: 14, currency: "GBP" } },
  routing: { mode: "static", threshold: 0.8, minSamples: 5, explore: { every: 4, types: ["docs", "config", "test", "refactor"] } },
  autonomy: { autoAt: 0.85, askBelow: 0.5 },
  models: { implementer: "sonnet" },
};

export const now = () => new Date().toISOString();
export const list = (v) => (typeof v === "string" && v.length ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);
export const norm = (p) => p.trim().replace(/^\.\//, "").replace(/\/+$/, "");
export const overlaps = (a, b) => a === b || a.startsWith(b + "/") || b.startsWith(a + "/");
export const touches = (csv, queries) => queries.length > 0 && list(csv).map(norm).some((s) => queries.some((q) => overlaps(s, q)));

export const fail = (msg) => { throw new Error(msg); };
export const oneOf = (v, allowed, name) => { if (!allowed.includes(v)) fail(`--${name} must be one of ${allowed.join("|")}${v === undefined || v === true ? "" : ` (got ${v})`}`); return v; };
export const int = (v, name) => { const n = Number(v); if (v === undefined || v === true || !Number.isInteger(n) || n < 0) fail(`--${name} must be a whole number`); return n; };
export const optInt = (v, name) => (v === undefined ? null : int(v, name));

export function loadConfig(dir) {
  const read = (f) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return {}; } };
  const cfg = structuredClone(DEFAULTS);
  for (const layer of [read(path.join(os.homedir(), ".claude", "foreman.json")), read(path.join(dir, "config.json"))])
    for (const [k, v] of Object.entries(layer)) cfg[k] = v && typeof v === "object" && !Array.isArray(v) && typeof cfg[k] === "object" ? { ...cfg[k], ...v } : v;
  return cfg;
}

const SYM = { GBP: "£", USD: "$", EUR: "€" };
export const money = (n, cur) => (SYM[cur] ?? (cur ? cur + " " : "")) + n.toFixed(2);
export const ktok = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? Math.round(n / 1e3) + "k" : String(n));
