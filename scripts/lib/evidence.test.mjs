import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { memoryDb } from "./db.mjs";
import { blend, confidence, dispatchFinish, dispatchList, dispatchStart, markFirstPass, routingSuggest, routingTable } from "./evidence.mjs";
import { DEFAULTS } from "./util.mjs";

const cfg = (over = {}) => ({ ...structuredClone(DEFAULTS), ...over });
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);
const seed = (db, { model = "sonnet", type = "api", pass, n, feature = 1, iteration = 0 }) => {
  for (let i = 0; i < n; i++) dispatchStart(db, { feature, iteration, role: "implementer", model, type, paths: `x/${model}-${type}-${feature}-${i}.ts` });
  const failed = Array.from({ length: n - pass }, (_, i) => `x/${model}-${type}-${feature}-${i}.ts`).join(",");
  markFirstPass(db, { feature, iteration, result: failed ? "FAILED" : "PASSED", failedPaths: failed });
};

test("blend weighs local samples with the prior as extra samples", () => {
  assert.equal(blend(0, 0, { rate: 0, n: 0 }), null);
  close(blend(3, 4, { rate: 0, n: 0 }), 0.75);
  close(blend(0, 0, { rate: 0.9, n: 10 }), 0.9);
  close(blend(2, 2, { rate: 0.5, n: 2 }), 0.75);
});

test("confidence is 0.65 on an empty repo", () => {
  const c = confidence(memoryDb(), cfg(), { types: ["api"], paths: ["src"] }, []);
  assert.equal(c.score, 0.65);
  assert.equal(c.band, "normal");
  assert.deepEqual(c.contributors.map((x) => x.factor), ["first-pass", "review changes", "backlog"]);
});

test("confidence: each contributor lowers the score by its weight", () => {
  const db = memoryDb();
  seed(db, { pass: 1, n: 4 });
  const fp = confidence(db, cfg(), { types: ["api"], paths: ["src/a.ts"] }, []);
  close(fp.contributors.find((c) => c.factor === "first-pass").penalty, 0.34);

  db.prepare("INSERT INTO features (id,title,files,started) VALUES (9,'f','src/a.ts','t')").run();
  db.prepare("INSERT INTO gate_events (feature_id,iteration,gate,result,created) VALUES (9,1,'review','REQUEST_CHANGES','t')").run();
  db.prepare("INSERT INTO backlog (area,severity,title,paths,created,updated) VALUES ('security','high','b','src/a.ts','t','t')").run();
  db.prepare("INSERT INTO lessons (kind,text,paths,created) VALUES ('gotcha','g','src/a.ts','t')").run();
  const c = confidence(db, cfg(), { types: ["api"], paths: ["src/a.ts"] }, []);
  assert.deepEqual(c.contributors.map((x) => [x.factor, x.penalty]), [["first-pass", 0.34], ["review changes", 0.25], ["backlog", 0.1]]);
  close(c.score, 0.26);
  assert.equal(c.band, "ask");
});

test("confidence clamps to 0..1", () => {
  const good = memoryDb();
  seed(good, { pass: 4, n: 4 });
  good.prepare("INSERT INTO features (id,title,files,started) VALUES (9,'f','src/a.ts','t')").run();
  good.prepare("INSERT INTO gate_events (feature_id,iteration,gate,result,created) VALUES (9,1,'review','APPROVE','t')").run();
  assert.equal(confidence(good, cfg(), { types: ["api"], paths: ["src/a.ts"] }, []).score, 1);

  const bad = memoryDb();
  seed(bad, { pass: 0, n: 4 });
  bad.prepare("INSERT INTO features (id,title,files,started) VALUES (9,'f','src/a.ts','t')").run();
  bad.prepare("INSERT INTO gate_events (feature_id,iteration,gate,result,created) VALUES (9,1,'review','REQUEST_CHANGES','t')").run();
  for (let i = 0; i < 5; i++) {
    bad.prepare("INSERT INTO backlog (area,severity,title,paths,created,updated) VALUES ('security','critical','b','src/a.ts','t','t')").run();
    bad.prepare("INSERT INTO lessons (kind,text,paths,created) VALUES ('gotcha','g','src/a.ts','t')").run();
  }
  assert.equal(confidence(bad, cfg(), { types: ["api"], paths: ["src/a.ts"] }, []).score, 0);
});

test("exploration tries the cheaper model on every Nth eligible unit, never on excluded types", () => {
  const db = memoryDb();
  const c = cfg({ routing: { ...DEFAULTS.routing, mode: "evidence", explore: { every: 2, types: ["docs", "auth"] } } });
  const s = (type, extra = {}) => routingSuggest(db, c, { types: [type], ...extra }, []);
  assert.deepEqual([s("docs").model, s("docs").model], ["sonnet", "haiku"]);
  assert.equal(s("docs").exploring, false);
  const e = s("docs");
  assert.deepEqual([e.model, e.exploring, e.basis], ["haiku", true, "exploring · 0/5 samples"]);
  for (let i = 0; i < 6; i++) assert.equal(s("auth").model, "sonnet");
  for (let i = 0; i < 4; i++) assert.equal(s("docs", { noExplore: true }).model, "sonnet");
  assert.equal(routingSuggest(db, cfg({ routing: { ...c.routing, mode: "static" } }), { types: ["docs"] }, []).exploring, false);
});

test("exploration stops once the cheaper model has minSamples for the type", () => {
  const db = memoryDb();
  const c = cfg({ routing: { ...DEFAULTS.routing, mode: "evidence", explore: { every: 1 } } });
  seed(db, { model: "haiku", type: "docs", pass: 2, n: 4 });
  assert.equal(routingSuggest(db, c, { types: ["docs"] }, []).basis, "exploring · 4/5 samples");
  seed(db, { model: "haiku", type: "docs", pass: 0, n: 1, feature: 2 });
  for (let i = 0; i < 3; i++) assert.equal(routingSuggest(db, c, { types: ["docs"] }, []).exploring, false);
});

test("a failure in a file two units touched leaves both unattributed", () => {
  const db = memoryDb();
  const a = dispatchStart(db, { feature: 1, iteration: 0, role: "implementer", model: "sonnet", type: "api", paths: "src/a.ts,src/types.ts" }).id;
  const b = dispatchStart(db, { feature: 1, iteration: 0, role: "implementer", model: "sonnet", type: "api", paths: "src/b.ts,src/types.ts" }).id;
  const c = dispatchStart(db, { feature: 1, iteration: 0, role: "implementer", model: "sonnet", type: "api", paths: "src/c.ts,src/types.ts" }).id;
  const r = markFirstPass(db, { feature: 1, iteration: 0, result: "FAILED", failedPaths: "src/types.ts,src/c.ts" });
  assert.deepEqual(r, { marked: 3, firstPass: 0, reworked: 1, unattributed: 2 });
  const rows = Object.fromEntries(dispatchList(db, 1).map((d) => [d.id, [d.first_pass, d.unattributed]]));
  assert.deepEqual([rows[a], rows[b], rows[c]], [[null, 1], [null, 1], [0, 0]]);
  assert.equal(markFirstPass(db, { feature: 1, iteration: 0, result: "PASSED" }).marked, 0);
  assert.deepEqual(routingTable(db, cfg()).map((g) => [g.dispatches, g.judged, g.unattributed]), [[3, 1, 2]]);
});

test("the mod's dispatches are keyed by agent id and marked as its own", () => {
  const db = memoryDb();
  dispatchStart(db, { feature: 1, iteration: 0, role: "scout", model: "haiku", agent: "ag1" });
  const lead = dispatchStart(db, { feature: 1, iteration: 0, role: "scout", model: "haiku" }).id;
  assert.deepEqual(dispatchFinish(db, { agent: "ag1", outcome: "completed", duration: 7, tokens: 900 }), { id: 1, outcome: "completed", duration_s: 7 });
  assert.throws(() => dispatchFinish(db, { agent: "ag1", outcome: "completed" }), /no open dispatch/);
  assert.throws(() => dispatchFinish(db, { id: lead, outcome: "PASSED" }), /--outcome/);
  assert.deepEqual(dispatchList(db, 1).map((d) => [d.agent_id, d.source, d.tokens]), [["ag1", "mod", 900], [null, "lead", null]]);
});

test("routing labels rows with fewer than 10 judged dispatches", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "foreman-small-"));
  const mem = (...a) => execFileSync("node", ["--no-warnings", new URL("../memory.mjs", import.meta.url).pathname, "--root", root, ...a, "--no-color"], { encoding: "utf8", env: { ...process.env, HOME: root } });
  const { id } = JSON.parse(mem("dispatch", "start", "--feature", "1", "--iteration", "0", "--role", "implementer", "--model", "sonnet", "--type", "docs", "--paths", "README.md", "--json"));
  mem("dispatch", "finish", String(id), "--outcome", "DONE");
  mem("dispatch", "mark-first-pass", "--feature", "1", "--iteration", "0", "--result", "PASSED");
  assert.match(mem("routing"), /docs\s+sonnet .*\(small n\)$/m);
  assert.match(mem("dispatch", "list"), / lead /);
});
