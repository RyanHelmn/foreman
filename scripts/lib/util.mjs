import { createHash } from "node:crypto";
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
  autonomy: { autoAt: 0.85, askBelow: 0.5, minSamples: 10 },
  models: { implementer: "sonnet" },
};

export const now = () => new Date().toISOString();
export const list = (v) => (typeof v === "string" && v.length ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);
export const norm = (p) => p.trim().replace(/^\.\//, "").replace(/\/+$/, "");
export const overlaps = (a, b) => a === b || a.startsWith(b + "/") || b.startsWith(a + "/");
// shortcut: one level of {a,b} braces, no nesting; upgrade if a pack needs nested alternatives
export const globRe = (glob) => new RegExp("(^|/)" + glob.replace(/[.+^$()|[\]\\]/g, "\\$&").replace(/\{([^{}]*)\}/g, (_, alts) => "\x01" + alts.split(",").join("\x02") + "\x03").replace(/\*\*\//g, "\0").replace(/\*\*/g, "\x04").replace(/\*/g, "[^/]*").replace(/\?/g, "[^/]").replace(/\0/g, "(?:.*/)?").replace(/\x04/g, ".*").replace(/\x01/g, "(?:").replace(/\x02/g, "|").replace(/\x03/g, ")") + "$");
export const touches = (csv, queries) => queries.length > 0 && list(csv).map(norm).some((s) => queries.some((q) => (s.includes("*") ? globRe(s).test(q) : overlaps(s, q))));

export const fail = (msg) => { throw new Error(msg); };
export const oneOf = (v, allowed, name) => { if (!allowed.includes(v)) fail(`--${name} must be one of ${allowed.join("|")}${v === undefined || v === true ? "" : ` (got ${v})`}`); return v; };
export const int = (v, name) => { const n = Number(v); if (v === undefined || v === true || !Number.isInteger(n) || n < 0) fail(`--${name} must be a whole number`); return n; };
export const optInt = (v, name) => (v === undefined ? null : int(v, name));

const merge = (cfg, layer) => {
  for (const [k, v] of Object.entries(layer)) cfg[k] = v && typeof v === "object" && !Array.isArray(v) && typeof cfg[k] === "object" ? { ...cfg[k], ...v } : v;
  return cfg;
};

export function loadConfig(dir) {
  const read = (f) => { try { const j = JSON.parse(fs.readFileSync(f, "utf8")); return j && typeof j === "object" && !Array.isArray(j) ? j : {}; } catch { return {}; } };
  const base = merge(structuredClone(DEFAULTS), read(path.join(os.homedir(), ".claude", "foreman.json")));
  const cfg = merge(structuredClone(base), read(path.join(dir, "config.json")));
  const num = (o, k) => (o && typeof o === "object" && Number.isFinite(o[k]) ? o[k] : DEFAULTS.autonomy[k]);
  cfg.autonomy = { ...(cfg.autonomy && typeof cfg.autonomy === "object" ? cfg.autonomy : {}), ...Object.fromEntries(["autoAt", "askBelow", "minSamples"].map((k) => [k, Math.max(num(base.autonomy, k), num(cfg.autonomy, k))])) };
  return cfg;
}

const trustFile = () => path.join(os.homedir(), ".claude", "foreman-trust.json");
const readTrust = () => { try { return JSON.parse(fs.readFileSync(trustFile(), "utf8")); } catch { return {}; } };

export function projectCommands(dir) {
  let commands = {};
  try { commands = JSON.parse(fs.readFileSync(path.join(dir, "config.json"), "utf8")).commands ?? {}; } catch {}
  const set = Object.fromEntries(Object.entries(commands).filter(([, v]) => typeof v === "string" && v).sort(([a], [b]) => a.localeCompare(b)));
  const hash = createHash("sha256").update(JSON.stringify(set)).digest("hex");
  const approved = !Object.keys(set).length || readTrust()[path.resolve(dir)] === hash;
  return { commands: set, hash, approved };
}

export function approveCommands(dir) {
  const c = projectCommands(dir);
  fs.mkdirSync(path.dirname(trustFile()), { recursive: true });
  fs.writeFileSync(trustFile(), JSON.stringify({ ...readTrust(), [path.resolve(dir)]: c.hash }, null, 2) + "\n");
  return { ...c, approved: true };
}

export function writeSafe(file, data) {
  const abs = path.resolve(file), parts = abs.split(path.sep), top = parts.lastIndexOf(".foreman");
  const root = top < 0 ? path.dirname(abs) : parts.slice(0, top + 1).join(path.sep);
  for (let p = abs; ; p = path.dirname(p)) {
    let link = false;
    try { link = fs.lstatSync(p).isSymbolicLink(); } catch {}
    if (link) fail(`refusing to write through symlink ${p}`);
    if (p === root || path.dirname(p) === p) break;
  }
  if (data !== undefined) fs.writeFileSync(file, data);
}
const SYM = { GBP: "£", USD: "$", EUR: "€" };
export const money = (n, cur) => (SYM[cur] ?? (cur ? cur + " " : "")) + n.toFixed(2);
export const ktok = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? Math.round(n / 1e3) + "k" : String(n));
