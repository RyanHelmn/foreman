import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { memoryDb } from "./lib/db.mjs";
import { lessonDelete, lessonList } from "./lib/memory-items.mjs";
import { build, detect, lint, loadPacks, scan } from "./lib/packs.mjs";

const tmp = (p) => fs.mkdtempSync(path.join(os.tmpdir(), p));
const put = (root, files) => {
  for (const [f, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true });
    fs.writeFileSync(path.join(root, f), typeof text === "string" ? text : JSON.stringify(text));
  }
};
const rule = (id, roles, words = 20) =>
  `---\nid: ${id}\ntitle: ${id} title\nimpact: HIGH\nimpactDescription: "it breaks"\nroles: [${roles}]\n---\n${"word ".repeat(words)}\n\n**Incorrect:**\n\n\`\`\`ts\nbad()\n\`\`\`\n\n**Correct:**\n\n\`\`\`ts\ngood()\n\`\`\`\n`;
const pack = (name, prefix, layer, extra = {}) => ({ [`${name}/pack.json`]: { name, prefix, layer, version: "1.0.0", ...extra }, [`${name}/_sections.md`]: "1. x" });

const fixture = () => {
  const dir = tmp("foreman-packs-");
  put(dir, {
    ...pack("_general", "gen", "general"),
    "_general/rules/gen-a.md": rule("gen-a", "implementer, reviewer"),
    "_general/roles/reviewer.md": "# _general · reviewer\nRead order: gen-a\n",
    ...pack("lang", "lang", "language", { detect: { files: ["lang.lock"] } }),
    ...pack("alang", "alang", "language", { extends: ["lang"], detect: { deps: ["alang-rt"] } }),
    "lang/rules/lang-x.md": rule("lang-x", "reviewer"),
    "lang/roles/reviewer.md": "# lang · reviewer\nRead order: lang-x\n\n## Obstacles to report\n- lang quirk\n",
    ...pack("fw", "fw", "framework", { extends: ["lang"], detect: { deps: ["fw-core"] } }),
    "fw/rules/fw-y.md": rule("fw-y", "implementer, reviewer"),
    "fw/rules/fw-unused.md": rule("fw-unused", "reviewer"),
    "fw/roles/implementer.md": "# fw · implementer\nRead order: fw-y\n",
    "fw/roles/reviewer.md": "# fw · reviewer\nRead order: fw-y, gen-a\n",
    "fw/gotchas.md": "- [gotcha] fw guards run in registration order · paths: **/app.module.ts\n",
    ...pack("lib", "lib", "library", { detect: { configKeys: ["libconf"] } }),
    ...pack("py", "py", "language", { detect: { deps: ["Django"] } }),
    ...pack("db", "db", "library", { detect: { contains: [{ files: "**/schema.prisma", pattern: 'provider\\s*=\\s*"postgresql"' }] } }),
  });
  return dir;
};

test("bundled packs pass lint", () => {
  assert.deepEqual(lint(loadPacks()), []);
});

test("lint catches broken packs", () => {
  const dir = fixture();
  put(dir, {
    "fw/rules/fw-long.md": rule("fw-long", "reviewer", 200),
    "fw/rules/wrong-name.md": rule("fw-other", "nobody"),
    "fw/roles/security.md": "# fw · security\nRead order: fw-y, nope-z\nYou are a senior security engineer.\n",
    "fw/gotchas.md": "- [gotcha] missing paths\n",
    "lib/pack.json": { name: "lib", prefix: "lib", layer: "plugin", extends: ["ghost"] },
  });
  const errors = lint(loadPacks(dir)).join("\n");
  for (const want of [/fw-long: \d+ words of prose/, /wrong-name\.md: file name must be <id>\.md/, /fw-other: roles must list/, /unknown rule nope-z/, /fw-y does not list security/, /no persona/, /bad line/, /lib: pack\.json layer/, /extends unknown pack ghost/, /lib: pack\.json needs a version/])
    assert.match(errors, want);
});

test("detect matches deps, files and config keys, adds extends, and orders by layer", () => {
  const dir = fixture();
  const repo = tmp("foreman-repo-");
  put(repo, { "apps/api/package.json": { dependencies: { "fw-core": "1", "alang-rt": "1" }, libconf: {} }, "requirements.txt": "django==5.0\n" });
  const hits = detect(loadPacks(dir), scan(repo));
  assert.deepEqual(hits.map((h) => h.name), ["_general", "lang", "py", "alang", "fw", "lib"]);
  assert.deepEqual(Object.fromEntries(hits.map((h) => [h.name, h.reason])), { _general: "always", lang: "extended by alang", py: "dep Django", alang: "dep alang-rt", fw: "dep fw-core", lib: "key libconf" });
  put(repo, { "tools/lang.lock": "", "prisma/schema.prisma": 'datasource db {\n  provider = "postgresql"\n}\n' });
  assert.match(detect(loadPacks(dir), scan(repo)).find((h) => h.name === "db").reason, /schema\.prisma contains/);
  assert.equal(detect(loadPacks(dir), scan(repo)).find((h) => h.name === "lang").reason, "file lang.lock");
});

test("build writes one file per role with only the named rules, once each, in precedence order", () => {
  const dir = fixture();
  const out = tmp("foreman-out-");
  put(out, { "skills.json": { implementer: [".claude/skills/x/SKILL.md"] } });
  const r = build(loadPacks(dir), ["fw"], out, memoryDb());
  assert.deepEqual(r.packs, ["_general", "lang", "fw"]);
  const reviewer = fs.readFileSync(path.join(out, "roles", "reviewer.md"), "utf8");
  const at = (s) => reviewer.indexOf(s);
  assert.ok(at("## _general") < at("## lang") && at("## lang") < at("## fw"));
  assert.equal(reviewer.split("### gen-a ·").length, 2);
  assert.match(reviewer, /### fw-y · HIGH — fw-y title\n_it breaks_/);
  assert.match(reviewer, /lang quirk/);
  assert.doesNotMatch(reviewer, /fw-unused/);
  assert.doesNotMatch(fs.readFileSync(path.join(out, "roles", "implementer.md"), "utf8"), /lang-x/);
  const skills = JSON.parse(fs.readFileSync(path.join(out, "skills.json"), "utf8"));
  assert.deepEqual(skills.implementer, [".claude/skills/x/SKILL.md"]);
  assert.equal(skills.roles.reviewer, ".foreman/roles/reviewer.md");
  assert.throws(() => build(loadPacks(dir), ["nope"], out, memoryDb()), /unknown pack nope/);
});

test("pack gotchas import once, match by glob, and stay deleted", () => {
  const dir = fixture();
  const out = tmp("foreman-out-");
  const db = memoryDb();
  assert.deepEqual(build(loadPacks(dir), ["fw"], out, db).gotchas, { imported: 1, skipped: 0 });
  assert.deepEqual(build(loadPacks(dir), ["fw"], out, db).gotchas, { imported: 0, skipped: 1 });
  const [l] = lessonList(db, 10);
  assert.deepEqual([l.source, l.paths], ["pack", "**/app.module.ts"]);
  lessonDelete(db, l.id);
  assert.deepEqual(build(loadPacks(dir), ["fw"], out, db).gotchas, { imported: 0, skipped: 1 });
  assert.equal(lessonList(db, 10).length, 0);
});

test("relevant finds a glob-pathed lesson, and the CLI builds roles end to end", () => {
  const repo = tmp("foreman-cli-");
  const env = { ...process.env, HOME: repo };
  const run = (script, ...a) => execFileSync("node", ["--no-warnings", new URL(script, import.meta.url).pathname, "--root", repo, ...a], { encoding: "utf8", env });
  run("./memory.mjs", "lesson", "add", "--kind", "gotcha", "--text", "guards run in order", "--paths", "**/app.module.ts");
  assert.match(run("./memory.mjs", "relevant", "--paths", "apps/api/src/app.module.ts"), /guards run in order/);
  assert.match(run("./packs.mjs", "build", "--packs", "_general"), /packs\s+_general/);
  assert.ok(fs.existsSync(path.join(repo, ".foreman", "roles", "security.md")));
});
