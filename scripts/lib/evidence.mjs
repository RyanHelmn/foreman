import fs from "node:fs";
import { CATEGORIES, DEFAULTS, GATE_ROLE, MOD_OUTCOMES, NEVER_EXPLORE, OUTCOMES, TASK_TYPES, fail, int, ktok, list, money, norm, now, oneOf, optInt, touches } from "./util.mjs";

export function loadPriors() {
  try { return JSON.parse(fs.readFileSync(new URL("../../priors.json", import.meta.url), "utf8")).rows ?? []; } catch { return []; }
}
const priorFor = (priors, role, type, model) => priors.find((p) => p.role === role && p.type === type && p.model === model) ?? priors.find((p) => p.role === role && p.type === "*" && p.model === model) ?? { rate: 0, n: 0 };
export const blend = (pass, n, prior) => (n + prior.n ? (pass + prior.rate * prior.n) / (n + prior.n) : null);
export const priceOf = (model, prices) => prices[model] ?? Object.entries(prices).find(([k]) => model.includes(k))?.[1] ?? null;
export const aliasOf = (model, prices) => (prices[model] ? model : Object.keys(prices).find((k) => model.includes(k)) ?? model);

function judgedRows(db, role, types, paths) {
  const q = paths.map(norm);
  return db.prepare("SELECT d.*, f.iterations AS feature_iterations FROM dispatches d LEFT JOIN features f ON f.id = d.feature_id WHERE d.role=?").all(role)
    .filter((r) => (!types.length || types.includes(r.task_type)) && (!q.length || touches(r.paths, q)));
}

export const costRows = (rows, prices) =>
  rows.map((r) => { const p = r.tokens ? priceOf(r.model, prices) : null; return { ...r, cost: p ? (r.tokens / 1e6) * p.perMTok : 0, currency: p?.currency ?? null }; });

export function summarizeCost(rows) {
  const c = { tokens: 0, cost: 0, currency: null, byRole: {}, byIteration: {}, top: null };
  const add = (o, k, r) => { o[k] ??= { tokens: 0, cost: 0 }; o[k].tokens += r.tokens ?? 0; o[k].cost += r.cost; };
  for (const r of rows.filter((r) => r.tokens)) {
    c.tokens += r.tokens; c.cost += r.cost; c.currency ??= r.currency;
    add(c.byRole, r.role, r); add(c.byIteration, r.iteration, r);
    if (!c.top || r.cost > c.top.cost || (r.cost === c.top.cost && r.tokens > c.top.tokens)) c.top = r;
  }
  return c;
}

export function featureStats(db, prices) {
  const stats = new Map();
  for (const r of costRows(db.prepare("SELECT * FROM dispatches").all(), prices)) {
    const s = stats.get(r.feature_id) ?? { tokens: 0, cost: 0, currency: null, firstPass: 0, judged: 0 };
    s.tokens += r.tokens ?? 0; s.cost += r.cost; s.currency ??= r.currency;
    if (r.first_pass !== null) { s.judged++; s.firstPass += r.first_pass; }
    stats.set(r.feature_id, s);
  }
  return stats;
}
export const statLine = (s) => [s.tokens ? `${ktok(s.tokens)} tok ${money(s.cost, s.currency)}` : "", s.judged ? `first-pass ${s.firstPass}/${s.judged}` : ""].filter(Boolean).join(" · ");

export const featureCost = (db, id, prices) => summarizeCost(costRows(db.prepare("SELECT * FROM dispatches WHERE feature_id=?").all(id), prices));

export function dispatchStart(db, a) {
  const feature = int(a.feature, "feature"), iteration = int(a.iteration, "iteration");
  const role = oneOf(a.role, Object.keys(OUTCOMES), "role");
  if (typeof a.model !== "string") fail("--model required");
  const type = oneOf(a.type ?? "other", TASK_TYPES, "type");
  const agent = typeof a.agent === "string" ? a.agent : null;
  const r = db.prepare("INSERT INTO dispatches (feature_id,iteration,role,model,unit,task_type,paths,started,agent_id,source) VALUES (?,?,?,?,?,?,?,?,?,?)")
    .run(feature, iteration, role, a.model, typeof a.unit === "string" ? a.unit : "", type, list(a.paths).map(norm).join(","), now(), agent, agent ? "mod" : "lead");
  return { id: Number(r.lastInsertRowid) };
}

export function dispatchFinish(db, a) {
  const d = typeof a.agent === "string"
    ? db.prepare("SELECT * FROM dispatches WHERE agent_id=? AND finished IS NULL ORDER BY id DESC").get(a.agent) ?? fail("no open dispatch for agent " + a.agent)
    : db.prepare("SELECT * FROM dispatches WHERE id=?").get(a.id) ?? fail("no dispatch " + a.id);
  if (d.finished) fail(`dispatch #${d.id} already finished`);
  const outcome = oneOf(a.outcome, OUTCOMES[d.role].concat(MOD_OUTCOMES), "outcome");
  const finished = now();
  const duration = optInt(a.duration, "duration") ?? Math.round((Date.parse(finished) - Date.parse(d.started)) / 1000);
  db.prepare("UPDATE dispatches SET finished=?, duration_s=?, tokens=?, tool_uses=?, outcome=?, notes=? WHERE id=?")
    .run(finished, duration, optInt(a.tokens, "tokens"), optInt(a.toolUses, "tool-uses"), outcome, typeof a.notes === "string" ? a.notes : "", d.id);
  return { id: d.id, outcome, duration_s: duration };
}

export const dispatchList = (db, feature) =>
  feature !== undefined ? db.prepare("SELECT * FROM dispatches WHERE feature_id=? ORDER BY id").all(int(feature, "feature")) : db.prepare("SELECT * FROM dispatches ORDER BY id DESC LIMIT 50").all();

export function markFirstPass(db, a) {
  const feature = int(a.feature, "feature"), iteration = int(a.iteration, "iteration");
  const result = oneOf(a.result, OUTCOMES.verifier, "result");
  const failed = list(a.failedPaths).map(norm);
  const all = db.prepare("SELECT id,paths,first_pass,unattributed FROM dispatches WHERE feature_id=? AND iteration=? AND role='implementer'").all(feature, iteration);
  const rows = all.filter((r) => r.first_pass === null && !r.unattributed);
  const owners = (f) => all.filter((r) => touches(r.paths, [f])).length;
  const judge = (r) => {
    const hit = failed.filter((f) => touches(r.paths, [f]));
    return !hit.length ? 1 : hit.some((f) => owners(f) === 1) ? 0 : null;
  };
  const marks = result === "PASSED" ? rows.map((r) => [r.id, 1]) : result === "FAILED" && failed.length ? rows.map((r) => [r.id, judge(r)]) : [];
  const upd = db.prepare("UPDATE dispatches SET first_pass=?, unattributed=? WHERE id=?");
  for (const [id, v] of marks) upd.run(v, v === null ? 1 : 0, id);
  const pass = marks.filter(([, v]) => v === 1).length, unattributed = marks.filter(([, v]) => v === null).length;
  return { marked: marks.length, firstPass: pass, reworked: marks.length - pass - unattributed, ...(unattributed ? { unattributed } : {}) };
}

export function gateAdd(db, a) {
  const feature = int(a.feature, "feature"), iteration = int(a.iteration, "iteration");
  const gate = oneOf(a.gate, Object.keys(GATE_ROLE), "gate");
  const result = oneOf(a.result, OUTCOMES[GATE_ROLE[gate]], "result");
  const cats = list(a.categories);
  for (const c of cats) oneOf(c, CATEGORIES, "categories");
  const r = db.prepare("INSERT INTO gate_events (feature_id,iteration,gate,result,finding_count,categories,created) VALUES (?,?,?,?,?,?,?)")
    .run(feature, iteration, gate, result, optInt(a.count, "count") ?? 0, cats.join(","), now());
  return { id: Number(r.lastInsertRowid) };
}

export function routingTable(db, cfg, { types = [], paths = [] } = {}) {
  for (const t of types) oneOf(t, TASK_TYPES, "type");
  const groups = new Map();
  for (const r of judgedRows(db, "implementer", types, paths)) {
    const model = aliasOf(r.model, cfg.prices);
    const g = groups.get(r.task_type + "\t" + model) ?? { type: r.task_type, model, dispatches: 0, judged: 0, firstPass: 0, unattributed: 0, features: new Map(), tokens: [] };
    g.dispatches++;
    if (r.first_pass !== null) { g.judged++; g.firstPass += r.first_pass; }
    if (r.unattributed) g.unattributed++;
    g.features.set(r.feature_id, r.feature_iterations ?? 0);
    if (r.tokens) g.tokens.push(r.tokens);
    groups.set(r.task_type + "\t" + model, g);
  }
  const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
  return [...groups.values()].map((g) => ({ type: g.type, model: g.model, dispatches: g.dispatches, judged: g.judged, unattributed: g.unattributed, firstPassRate: g.judged ? g.firstPass / g.judged : null, meanIterations: mean([...g.features.values()]), meanTokens: mean(g.tokens) }))
    .sort((a, b) => a.type.localeCompare(b.type) || a.model.localeCompare(b.model));
}

const bump = (db, key) => db.prepare("INSERT INTO meta (key,value) VALUES (?,1) ON CONFLICT(key) DO UPDATE SET value=value+1 RETURNING value").get(key).value;

export function routingSuggest(db, cfg, { role = "implementer", types = [], paths = [], noExplore = false }, priors = loadPriors()) {
  oneOf(role, Object.keys(OUTCOMES), "role");
  for (const t of types) oneOf(t, TASK_TYPES, "type");
  if (types.length !== 1) fail("routing suggest needs one --type");
  const type = types[0];
  const fallback = cfg.models?.[role] ?? DEFAULTS.models.implementer;
  const { threshold, minSamples } = cfg.routing;
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

  const explore = { ...DEFAULTS.routing.explore, ...cfg.routing.explore };
  const cheaper = candidates[candidates.indexOf(aliasOf(res.model, cfg.prices)) - 1];
  if (!noExplore && cfg.routing.mode === "evidence" && cheaper && explore.every > 0 && explore.types.includes(type) && !NEVER_EXPLORE.includes(type)) {
    const n = judgedRows(db, role, types, []).filter((r) => r.first_pass !== null && aliasOf(r.model, cfg.prices) === cheaper).length;
    if (n < minSamples && bump(db, "explore") % explore.every === 0)
      return { role, type, model: cheaper, rate: null, n, basis: `exploring · ${n}/${minSamples} samples`, exploring: true };
  }
  return { role, type, ...res, exploring: false };
}

export function confidence(db, cfg, { types = [], paths = [] }, priors = loadPriors()) {
  for (const t of types) oneOf(t, TASK_TYPES, "types");
  const q = paths.map(norm);
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
  const changed = [...reviewed.values()].filter(Boolean).length;
  const rc = reviewed.size ? changed / reviewed.size : 0.5;
  const backlog = db.prepare("SELECT paths FROM backlog WHERE status='open' AND severity IN ('critical','high')").all().filter((b) => touches(b.paths, q)).length;
  const gotchas = db.prepare("SELECT paths FROM lessons WHERE kind='gotcha'").all().filter((l) => touches(l.paths, q)).length;
  // score = 1 − 0.45·(1−firstPass) − 0.25·reviewChangeRate − min(0.2, 0.1·openCritHighBacklog) − min(0.1, 0.05·gotchas)
  // unknown rates default to 0.5, so a repo with no evidence scores 0.65 (between askBelow and autoAt); monotone: more risk never raises it
  const contributors = [
    { factor: "first-pass", penalty: 0.45 * (1 - fp), detail: `${types.join(",") || "any type"} ${fp.toFixed(2)}${judged.length ? ` (${judged.length} local)` : " (no local data)"}` },
    { factor: "review changes", penalty: 0.25 * rc, detail: reviewed.size ? `${changed}/${reviewed.size} reviews on these paths needed changes` : "no reviews on these paths" },
    { factor: "backlog", penalty: Math.min(0.2, 0.1 * backlog), detail: `${backlog} open critical/high on these paths` },
    { factor: "gotchas", penalty: Math.min(0.1, 0.05 * gotchas), detail: `${gotchas} gotcha lesson${gotchas === 1 ? "" : "s"} on these paths` },
  ].sort((a, b) => b.penalty - a.penalty);
  const score = Math.max(0, Math.min(1, 1 - contributors.reduce((a, c) => a + c.penalty, 0)));
  const band = score >= cfg.autonomy.autoAt ? "auto" : score < cfg.autonomy.askBelow ? "ask" : "normal";
  return { score: Math.round(score * 100) / 100, band, contributors: contributors.slice(0, 3).map((c) => ({ ...c, penalty: Math.round(c.penalty * 100) / 100 })) };
}
