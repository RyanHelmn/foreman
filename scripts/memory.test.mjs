import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const script = new URL("./memory.mjs", import.meta.url).pathname;
const root = fs.mkdtempSync(path.join(os.tmpdir(), "foreman-mem-"));
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
