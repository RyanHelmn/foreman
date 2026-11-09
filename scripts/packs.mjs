#!/usr/bin/env node
// foreman packs — stack rules for each worker role, selected per project.
//
// Usage:  node scripts/packs.mjs <command> [options]   (run from the project root, or pass --root <dir>)
//
//   detect  [--json]                 packs matching this project's manifests and files, in precedence order
//   build   --packs a,b [--json]     write .foreman/roles/<role>.md, skills.json packs/roles, import pack gotchas
//   lint    [--pack a,b] [--dir D]   check packs against packs/_schema.md (all by default)
//   list    [--json]                 every bundled pack with its rule count and role word counts

import fs from "node:fs";
import path from "node:path";
import { openDb } from "./lib/db.mjs";
import { PACKS_DIR, ROLES, build, detect, lint, loadPacks, scan } from "./lib/packs.mjs";
import { list } from "./lib/util.mjs";

const argv = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith("--")) positional.push(argv[i]);
  else if (argv[i + 1] === undefined || argv[i + 1].startsWith("--")) flags[argv[i].slice(2)] = true;
  else flags[argv[i].slice(2)] = argv[++i];
}
const ROOT = path.resolve(flags.root || process.cwd());
const out = (text, obj) => console.log(flags.json ? JSON.stringify(obj, null, 2) : text);
const packs = loadPacks(flags.dir ? path.resolve(flags.dir) : PACKS_DIR);

const commands = {
  detect() {
    const hits = detect(packs, scan(ROOT));
    out(hits.map((h) => `${h.name.padEnd(16)} ${h.reason}`).join("\n"), hits);
  },
  build() {
    const names = list(flags.packs);
    if (!names.length) throw new Error("build --packs a,b (from detect, after the user confirms)");
    const db = openDb(path.join(ROOT, ".foreman"));
    try {
      const r = build(packs, names, path.join(ROOT, ".foreman"), db);
      out([`packs   ${r.packs.join(", ")}`, `roles   ${ROLES.map((x) => `${x} ${r.words[x]}w`).join(" · ")}`, `gotchas ${r.gotchas.imported} imported · ${r.gotchas.skipped} already seen`].join("\n"), r);
    } finally {
      db.close();
    }
  },
  lint() {
    const only = list(flags.pack);
    const errors = lint(packs).filter((e) => !only.length || only.includes(e.split(":")[0]));
    if (errors.length) throw new Error(`${errors.length} problem(s)\n` + errors.join("\n"));
    out(`${packs.size} packs · ${[...packs.values()].reduce((a, p) => a + p.rules.size, 0)} rules · ok`, { ok: true });
  },
  list() {
    const rows = [...packs.values()].map((p) => ({ name: p.name, layer: p.layer, rules: p.rules.size, roles: Object.keys(p.roles), extends: p.extends ?? [] }));
    out(rows.map((r) => `${r.name.padEnd(16)} ${r.layer.padEnd(10)} ${String(r.rules).padStart(3)} rules  ${r.roles.join(",")}${r.extends.length ? `  extends ${r.extends.join(",")}` : ""}`).join("\n"), rows);
  },
};

const cmd = positional[0];
if (!commands[cmd]) {
  console.log(fs.readFileSync(new URL(import.meta.url), "utf8").split("\n").filter((l) => l.startsWith("//")).map((l) => l.slice(3)).join("\n"));
  process.exit(cmd ? 1 : 0);
}
try {
  commands[cmd]();
} catch (e) {
  console.error("packs: " + e.message);
  process.exitCode = 1;
}
