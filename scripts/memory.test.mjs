import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const script = new URL("./memory.mjs", import.meta.url).pathname;
const root = fs.mkdtempSync(path.join(os.tmpdir(), "foreman-mem-"));
process.env.HOME = root;
const mem = (...args) => execFileSync("node", ["--no-warnings", script, "--root", root, ...args], { encoding: "utf8" }).trim();
const memJson = (...args) => JSON.parse(mem(...args, "--json"));

test("init writes the db and its own .gitignore", () => {
  mem("init");
  assert.ok(fs.existsSync(path.join(root, ".foreman", "memory.db")));
  assert.match(fs.readFileSync(path.join(root, ".foreman", ".gitignore"), "utf8"), /run\.json/);
});
test("feature start/finish round-trips and exports MEMORY.md", () => {
  const { id } = memJson("feature", "start", "--title", "Add rate limiting", "--files", "src/auth/guard.ts");
  mem("lesson", "add", "--feature", String(id), "--kind", "gotcha", "--text", "ThrottlerGuard must come after AuthGuard", "--paths", "src/auth");
  mem("feature", "finish", String(id), "--outcome", "done", "--iterations", "2", "--flipped", "login-lockout fixed");
  const f = memJson("feature", "show", String(id));
  assert.equal(f.outcome, "done");
  assert.equal(f.iterations, 2);
  assert.equal(f.lessons.length, 1);
  assert.match(fs.readFileSync(path.join(root, ".foreman", "MEMORY.md"), "utf8"), /foreman:snapshot/);
});
test("recall matches inside identifiers (trigram)", () => {
  const hits = memJson("recall", "throttler");
  assert.ok(hits.some((h) => h.kind === "lesson"));
});
test("relevant finds lessons by path prefix", () => {
  const hits = memJson("relevant", "--paths", "src/auth/login.service.ts");
  assert.ok(hits.some((h) => h.kind === "lesson"));
});
test("backlog add/list/update", () => {
  const { id } = memJson("backlog", "add", "--title", "Swagger exposed", "--area", "security", "--severity", "high");
  assert.equal(memJson("backlog", "list").length, 1);
  mem("backlog", "update", String(id), "--status", "done");
  assert.equal(memJson("backlog", "list").length, 0);
  assert.equal(memJson("backlog", "list", "--status", "all").length, 1);
});
test("db rebuilds from MEMORY.md", () => {
  mem("export");
  for (const f of fs.readdirSync(path.join(root, ".foreman"))) if (f.startsWith("memory.db")) fs.rmSync(path.join(root, ".foreman", f));
  const s = memJson("stats");
  assert.equal(s.features, 1);
  assert.equal(s.lessons, 1);
});
test("relevant matches path segments, not substrings", () => {
  mem("lesson", "add", "--kind", "gotcha", "--text", "Author names are trimmed on save", "--paths", "src/author.ts");
  const hits = memJson("relevant", "--paths", "src/auth/login.ts");
  assert.ok(hits.some((h) => h.line.includes("ThrottlerGuard")));
  assert.ok(!hits.some((h) => h.line.includes("Author names")));
});

const memFail = (...args) => assert.throws(() => execFileSync("node", ["--no-warnings", script, "--root", root, ...args], { stdio: "pipe" }));
const start = (iteration, role, model, paths, type = "api") =>
  memJson("dispatch", "start", "--feature", "1", "--iteration", String(iteration), "--role", role, "--model", model, "--unit", paths, "--type", type, "--paths", paths).id;

test("dispatch and gate vocabularies are enforced", () => {
  memFail("dispatch", "start", "--feature", "1", "--iteration", "0", "--role", "implementer", "--model", "sonnet", "--type", "frontend");
  memFail("dispatch", "start", "--feature", "1", "--iteration", "0", "--role", "boss", "--model", "sonnet");
  const id = start(0, "scout", "haiku", "src");
  memFail("dispatch", "finish", String(id), "--outcome", "PASSED");
  mem("dispatch", "finish", String(id), "--outcome", "DONE", "--tokens", "1200", "--tool-uses", "4", "--duration", "9");
  memFail("dispatch", "finish", String(id), "--outcome", "DONE");
  memFail("gate", "add", "--feature", "1", "--iteration", "1", "--gate", "verify", "--result", "APPROVE");
  memFail("gate", "add", "--feature", "1", "--iteration", "1", "--gate", "verify", "--result", "FAILED", "--categories", "vibes");
  const d = memJson("dispatch", "list", "--feature", "1").find((r) => r.id === id);
  assert.deepEqual([d.tokens, d.tool_uses, d.duration_s, d.outcome], [1200, 4, 9, "DONE"]);
});

test("mark-first-pass splits by failed paths, and marks nothing without them", () => {
  const a = start(0, "implementer", "sonnet", "src/auth/guard.ts", "auth");
  const b = start(0, "implementer", "sonnet", "src/author.ts", "api");
  for (const id of [a, b]) mem("dispatch", "finish", String(id), "--outcome", "DONE");
  assert.equal(memJson("dispatch", "mark-first-pass", "--feature", "1", "--iteration", "0", "--result", "FAILED").marked, 0);
  assert.equal(memJson("dispatch", "mark-first-pass", "--feature", "1", "--iteration", "0", "--result", "INCONCLUSIVE", "--failed-paths", "src/auth").marked, 0);
  assert.deepEqual(memJson("dispatch", "mark-first-pass", "--feature", "1", "--iteration", "0", "--result", "FAILED", "--failed-paths", "src/auth"), { marked: 2, firstPass: 1, reworked: 1 });
  assert.equal(memJson("dispatch", "mark-first-pass", "--feature", "1", "--iteration", "0", "--result", "PASSED").marked, 0);
  const rows = memJson("dispatch", "list", "--feature", "1");
  assert.equal(rows.find((r) => r.id === a).first_pass, 0);
  assert.equal(rows.find((r) => r.id === b).first_pass, 1);
  mem("gate", "add", "--feature", "1", "--iteration", "1", "--gate", "verify", "--result", "FAILED", "--count", "2", "--categories", "test-fail,type-error");
});

test("dispatches and gate events survive export, db loss and import", () => {
  const before = memJson("dispatch", "list", "--feature", "1");
  mem("export");
  for (const f of fs.readdirSync(path.join(root, ".foreman"))) if (f.startsWith("memory.db")) fs.rmSync(path.join(root, ".foreman", f));
  assert.deepEqual(memJson("dispatch", "list", "--feature", "1"), before);
  mem("import");
  assert.deepEqual(memJson("dispatch", "list", "--feature", "1"), before);
  const snap = JSON.parse(fs.readFileSync(path.join(root, ".foreman", "MEMORY.md"), "utf8").match(/```json\s*([\s\S]*?)```/)[1]);
  assert.equal(snap.gate_events[0].categories, "test-fail,type-error");
});

test("a MEMORY.md from before dispatches existed still imports", () => {
  const old = fs.mkdtempSync(path.join(os.tmpdir(), "foreman-old-"));
  fs.mkdirSync(path.join(old, ".foreman"));
  const dump = { features: [{ id: 1, title: "Legacy", outcome: "done", started: "2026-01-01T00:00:00Z" }], lessons: [], decisions: [], backlog: [] };
  fs.writeFileSync(path.join(old, ".foreman", "MEMORY.md"), "# foreman memory\n\n<!-- foreman:snapshot -->\n```json\n" + JSON.stringify(dump) + "\n```\n");
  const run = (...a) => JSON.parse(execFileSync("node", ["--no-warnings", script, "--root", old, ...a, "--json"], { encoding: "utf8" }));
  assert.equal(run("stats").features, 1);
  assert.deepEqual(run("dispatch", "list"), []);
});

test("cost splits by role and iteration and names the priciest dispatch", () => {
  const { id: fid } = memJson("feature", "start", "--title", "Costed");
  const d = (it, role, model, tokens) => {
    const { id } = memJson("dispatch", "start", "--feature", String(fid), "--iteration", String(it), "--role", role, "--model", model, "--unit", role + it);
    mem("dispatch", "finish", String(id), "--outcome", { implementer: "DONE", reviewer: "APPROVE", verifier: "PASSED" }[role], "--tokens", String(tokens));
  };
  d(0, "implementer", "sonnet", 1_000_000);
  d(1, "verifier", "claude-sonnet-5-5", 500_000);
  d(1, "reviewer", "opus", 1_000_000);
  const c = memJson("cost", String(fid));
  assert.equal(c.tokens, 2_500_000);
  assert.equal(c.currency, "GBP");
  assert.ok(Math.abs(c.cost - (2.8 + 1.4 + 5.6)) < 1e-9);
  assert.equal(c.byRole.reviewer.tokens, 1_000_000);
  assert.equal(c.byIteration["1"].tokens, 1_500_000);
  assert.equal(c.top.role, "reviewer");

  const listed = memJson("feature", "list").find((f) => f.id === fid);
  assert.ok(Math.abs(listed.cost - 9.8) < 1e-9);

  fs.writeFileSync(path.join(root, ".foreman", "config.json"), JSON.stringify({ prices: { opus: { perMTok: 10, currency: "GBP" } } }));
  assert.ok(Math.abs(memJson("cost", String(fid)).cost - 14.2) < 1e-9);
  fs.rmSync(path.join(root, ".foreman", "config.json"));

  const rep = memJson("feature", "report", String(fid));
  const md = fs.readFileSync(path.join(root, ".foreman", "reports", `${fid}.md`), "utf8");
  assert.equal(rep.units.length, 1);
  assert.match(md, /## Gate events/);
  assert.match(md, /Priciest: #\d+ reviewer opus/);

  mem("export");
  assert.match(fs.readFileSync(path.join(root, ".foreman", "MEMORY.md"), "utf8"), /2\.5M tok £9\.80/);
});

test("routing reports first-pass by type and model, and suggest needs evidence", () => {
  const { id: fid } = memJson("feature", "start", "--title", "Routing evidence");
  const run = (model, type, pass, n) => {
    for (let i = 0; i < n; i++) {
      const { id } = memJson("dispatch", "start", "--feature", String(fid), "--iteration", "0", "--role", "implementer", "--model", model, "--type", type, "--paths", `db/m${model}${i}.sql`);
      mem("dispatch", "finish", String(id), "--outcome", "DONE");
    }
    const failed = Array.from({ length: n - pass }, (_, i) => `db/m${model}${i}.sql`).join(",");
    mem("dispatch", "mark-first-pass", "--feature", String(fid), "--iteration", "0", "--result", failed ? "FAILED" : "PASSED", ...(failed ? ["--failed-paths", failed] : []));
  };
  const suggest = () => memJson("routing", "suggest", "--role", "implementer", "--type", "migration");
  assert.deepEqual([suggest().model, suggest().basis], ["sonnet", "insufficient evidence (n=0)"]);
  run("sonnet", "migration", 2, 7);
  run("opus", "migration", 7, 7);
  const table = memJson("routing", "--type", "migration");
  assert.deepEqual(table.map((r) => [r.model, r.dispatches, r.judged]), [["opus", 7, 7], ["sonnet", 7, 7]]);
  assert.ok(Math.abs(table[1].firstPassRate - 2 / 7) < 1e-9);
  const s = suggest();
  assert.equal(s.model, "opus");
  assert.equal(s.basis, "sonnet first-pass on migration 2/7 here");
  assert.equal(memJson("routing", "suggest", "--role", "implementer", "--type", "migration", "--paths", "src").basis, "insufficient evidence (n=0)");
  memFail("routing", "suggest", "--type", "frontend");
});

test("briefing suggests evidence routing once 10 finished features have dispatches", () => {
  const b = () => mem("briefing", "--no-color");
  assert.doesNotMatch(b(), /routing=evidence/);
  for (let i = 0; i < 10; i++) {
    const { id } = memJson("feature", "start", "--title", "f" + i);
    mem("dispatch", "start", "--feature", String(id), "--iteration", "0", "--role", "scout", "--model", "haiku");
    mem("feature", "finish", String(id), "--outcome", "done");
  }
  assert.match(b(), /routing=evidence/);
  fs.writeFileSync(path.join(root, ".foreman", "config.json"), JSON.stringify({ routing: { mode: "evidence" } }));
  assert.doesNotMatch(b(), /routing=evidence/);
  fs.rmSync(path.join(root, ".foreman", "config.json"));
});

test("confidence starts at 0.65 with no evidence and only goes down with risk", () => {
  const fresh = fs.mkdtempSync(path.join(os.tmpdir(), "foreman-conf-"));
  const run = (...a) => JSON.parse(execFileSync("node", ["--no-warnings", script, "--root", fresh, ...a, "--json"], { encoding: "utf8" }));
  const c0 = run("confidence", "--types", "api", "--paths", "src/billing");
  assert.equal(c0.score, 0.65);
  assert.equal(c0.band, "normal");
  assert.equal(c0.contributors.length, 3);
  run("lesson", "add", "--kind", "gotcha", "--text", "Stripe amounts are in pence", "--paths", "src/billing");
  run("lesson", "add", "--kind", "gotcha", "--text", "unrelated", "--paths", "src/billingx");
  run("backlog", "add", "--title", "Webhook not verified", "--area", "security", "--severity", "critical", "--paths", "src/billing/webhook.ts");
  const c1 = run("confidence", "--types", "api", "--paths", "src/billing/webhook.ts");
  assert.equal(c1.score, 0.5);
  const { id } = run("feature", "start", "--title", "billing", "--files", "src/billing/webhook.ts");
  run("gate", "add", "--feature", String(id), "--iteration", "1", "--gate", "review", "--result", "APPROVE");
  run("gate", "add", "--feature", String(id), "--iteration", "1", "--gate", "review", "--result", "APPROVE", "--count", "2", "--categories", "auto-applied,convention");
  const c2 = run("confidence", "--types", "api", "--paths", "src/billing/webhook.ts");
  assert.equal(c2.score, 0.38);
  assert.equal(c2.band, "ask");
  assert.equal(c2.contributors[0].factor, "review changes");
  memFail("confidence", "--types", "frontend", "--paths", "x");
});
