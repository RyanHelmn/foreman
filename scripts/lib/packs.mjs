import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { importGotchas } from "./memory-items.mjs";
import { globRe, writeSafe } from "./util.mjs";

export const ROLES = ["implementer", "reviewer", "security", "verifier"];
export const PACKS_DIR = fileURLToPath(new URL("../../packs/", import.meta.url));
const IMPACT = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const LAYERS = ["general", "language", "framework", "library"];
const RULE_WORDS = 150, ROLE_WORDS = 300;

export function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i < 0) continue;
    let v = line.slice(i + 1).trim();
    if (v.startsWith("[") && v.endsWith("]")) v = v.slice(1, -1).split(",").map((s) => s.trim()).filter(Boolean);
    else if (/^(["']).*\1$/.test(v)) v = v.slice(1, -1);
    meta[line.slice(0, i).trim()] = v;
  }
  return { meta, body: m[2].trim() };
}

const prose = (md) => md.replace(/```[\s\S]*?```/g, "").split(/\s+/).filter((w) => /\w/.test(w)).length;
const readOrder = (text) => (text.match(/^Read order:\s*(.*)$/m)?.[1] ?? "").split(",").map((s) => s.replace(/`/g, "").trim()).filter(Boolean);
const read = (f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null);

export function loadPacks(dir = PACKS_DIR) {
  const packs = new Map();
  for (const name of fs.readdirSync(dir).sort()) {
    const pdir = path.join(dir, name);
    const manifest = read(path.join(pdir, "pack.json"));
    if (!manifest) continue;
    const rulesDir = path.join(pdir, "rules");
    const rules = new Map();
    for (const f of fs.existsSync(rulesDir) ? fs.readdirSync(rulesDir).filter((f) => f.endsWith(".md")).sort() : []) {
      const parsed = parseFrontmatter(fs.readFileSync(path.join(rulesDir, f), "utf8"));
      rules.set(parsed?.meta.id ?? f, { file: f, ...(parsed ?? { meta: {}, body: "" }) });
    }
    const roles = Object.fromEntries(ROLES.map((r) => [r, read(path.join(pdir, "roles", `${r}.md`))]).filter(([, t]) => t));
    const gotchas = (read(path.join(pdir, "gotchas.md")) ?? "").split("\n").filter((l) => l.startsWith("- ")).map((l) => {
      const m = l.match(/^- \[gotcha\] (.+?) · paths: (\S+)\s*$/);
      return m ? { text: m[1], paths: m[2] } : { bad: l };
    });
    packs.set(name, { name, dir: pdir, ...JSON.parse(manifest), rules, roles, gotchas, hasSections: fs.existsSync(path.join(pdir, "_sections.md")) });
  }
  return packs;
}

const lineage = (packs, name, seen = new Set()) => {
  if (seen.has(name) || !packs.has(name)) return seen;
  seen.add(name);
  for (const e of packs.get(name).extends ?? []) lineage(packs, e, seen);
  return seen;
};

export function lint(packs) {
  const errors = [];
  const ids = new Map();
  for (const p of packs.values()) {
    const e = (msg) => errors.push(`${p.name}: ${msg}`);
    if (!p.prefix) e("pack.json needs a prefix");
    if (!LAYERS.includes(p.layer)) e(`pack.json layer must be one of ${LAYERS.join("|")}`);
    if (!p.version) e("pack.json needs a version");
    for (const x of p.extends ?? []) if (!packs.has(x)) e(`extends unknown pack ${x}`);
    if (!p.hasSections) e("missing _sections.md");
    for (const [id, r] of p.rules) {
      const m = r.meta;
      if (ids.has(id)) e(`rule id ${id} also in ${ids.get(id)}`);
      ids.set(id, p.name);
      if (r.file !== `${id}.md`) e(`${r.file}: file name must be <id>.md`);
      if (!id.startsWith(`${p.prefix}-`)) e(`${id}: id must start with ${p.prefix}-`);
      for (const k of ["title", "impactDescription"]) if (!m[k]) e(`${id}: missing ${k}`);
      if (!IMPACT.includes(m.impact)) e(`${id}: impact must be one of ${IMPACT.join("|")}`);
      if (!Array.isArray(m.roles) || !m.roles.length || m.roles.some((x) => !ROLES.includes(x))) e(`${id}: roles must list some of ${ROLES.join(", ")}`);
      if (!/\*\*Incorrect/.test(r.body) || !/\*\*Correct/.test(r.body)) e(`${id}: needs **Incorrect** and **Correct** blocks`);
      if (prose(r.body) > RULE_WORDS) e(`${id}: ${prose(r.body)} words of prose (max ${RULE_WORDS}); split it`);
    }
    for (const [role, text] of Object.entries(p.roles)) {
      if (prose(text) > ROLE_WORDS) e(`roles/${role}.md: ${prose(text)} words (max ${ROLE_WORDS})`);
      for (const id of readOrder(text)) {
        const owner = [...lineage(packs, p.name), "_general"].map((n) => packs.get(n)).find((q) => q?.rules.has(id));
        if (!owner) e(`roles/${role}.md: Read order names unknown rule ${id}`);
        else if (!owner.rules.get(id).meta.roles?.includes(role)) e(`roles/${role}.md: ${id} does not list ${role} in its roles`);
      }
    }
    for (const g of p.gotchas) if (g.bad) e(`gotchas.md: bad line "${g.bad}" (want "- [gotcha] <text> · paths: <glob>")`);
    const texts = [...p.rules.values()].map((r) => r.body).concat(Object.values(p.roles));
    if (texts.some((t) => /\byou are an? /i.test(t))) e("no persona sentences");
    if (texts.some((t) => /\b(Bash|Read|Grep|Glob|Edit|Write) tool\b/.test(t))) e("name actions, not tools");
  }
  return errors;
}

function repoFiles(root) {
  try {
    return execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: root, encoding: "utf8", maxBuffer: 64 << 20 }).split("\n").filter(Boolean);
  } catch {
    const out = [];
    const walk = (d, rel) => {
      for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
        if (/^(node_modules|\.git|dist|build|target|vendor|\.venv|\.next)$/.test(ent.name)) continue;
        const r = rel ? `${rel}/${ent.name}` : ent.name;
        if (ent.isDirectory()) walk(path.join(d, ent.name), r);
        else out.push(r);
      }
    };
    walk(root, "");
    return out;
  }
}

const JSON_MANIFEST = /(^|\/)(package|composer)\.json$/;
const TEXT_MANIFEST = /(^|\/)(pyproject\.toml|requirements[^/]*\.txt|Pipfile|go\.mod|Cargo\.toml|Gemfile|pubspec\.yaml|[^/]+\.csproj|build\.gradle(\.kts)?|pom\.xml)$/;

export function scan(root) {
  const files = repoFiles(root);
  const deps = new Set(), keys = new Set(), texts = [];
  for (const f of files) {
    if (JSON_MANIFEST.test(f)) {
      try {
        const j = JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));
        for (const k of Object.keys(j)) keys.add(k);
        for (const s of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies", "require", "require-dev"]) for (const d of Object.keys(j[s] ?? {})) deps.add(d);
      } catch {}
    } else if (TEXT_MANIFEST.test(f)) texts.push(fs.readFileSync(path.join(root, f), "utf8"));
  }
  return { root, files, deps, keys, text: texts.join("\n") };
}

const word = (name) => new RegExp(`(^|[^\\w@/.-])${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^\\w-]|$)`, "mi");

export function detect(packs, seen) {
  const hits = new Map([["_general", "always"]]);
  for (const p of packs.values()) {
    const d = p.detect ?? {};
    // names of 3 chars or fewer (ai, pg) match only package.json/composer.json keys; as words they hit prose in other manifests
    const dep = (d.deps ?? []).find((x) => seen.deps.has(x) || (x.length > 3 && word(x).test(seen.text)));
    const file = (d.files ?? []).find((g) => seen.files.some((f) => globRe(g).test(f)));
    const key = (d.configKeys ?? []).find((k) => seen.keys.has(k));
    const has = (d.contains ?? []).find((c) => seen.files.some((f) => globRe(c.files).test(f) && new RegExp(c.pattern, "m").test(fs.readFileSync(path.join(seen.root, f), "utf8"))));
    if (dep || file || key || has) hits.set(p.name, dep ? `dep ${dep}` : file ? `file ${file}` : key ? `key ${key}` : `${has.files} contains ${has.pattern}`);
  }
  for (const name of [...hits.keys()]) for (const x of lineage(packs, name)) if (!hits.has(x)) hits.set(x, `extended by ${name}`);
  return order(packs, [...hits.keys()].filter((n) => packs.has(n))).map((name) => ({ name, reason: hits.get(name) }));
}

const depth = (packs, name) => Math.max(0, ...(packs.get(name).extends ?? []).filter((e) => packs.has(e)).map((e) => 1 + depth(packs, e)));
export const order = (packs, names) =>
  [...new Set(names)].sort((a, b) => LAYERS.indexOf(packs.get(a).layer) - LAYERS.indexOf(packs.get(b).layer) || depth(packs, a) - depth(packs, b) || a.localeCompare(b));

const render = (id, r) => [`### ${id} · ${r.meta.impact} — ${r.meta.title}`, `_${r.meta.impactDescription}_`, "", r.body].join("\n");

export const VERSION = JSON.parse(fs.readFileSync(new URL("../../.claude-plugin/plugin.json", import.meta.url), "utf8")).version;

export function builtState(foremanDir) {
  let skills = {};
  try { skills = JSON.parse(fs.readFileSync(path.join(foremanDir, "skills.json"), "utf8")); } catch {}
  const packs = skills.packs ?? [];
  const perPack = packs.length > 0 && ROLES.every((r) => fs.existsSync(path.join(foremanDir, "roles", r, "_general.md")));
  return { packs, builtWith: skills.builtWith ?? null, version: VERSION, stale: packs.length > 0 && (skills.builtWith !== VERSION || !perPack) };
}

export function build(packs, names, foremanDir, db) {
  for (const n of names) if (!packs.has(n)) throw new Error(`unknown pack ${n}`);
  const sel = order(packs, [...names, "_general"].flatMap((n) => [...lineage(packs, n)]));
  const all = new Map(sel.flatMap((n) => [...packs.get(n).rules]));
  const words = {};
  for (const role of ROLES) {
    const perPack = path.join(foremanDir, "roles", role);
    const legacy = path.join(foremanDir, "roles", `${role}.md`);
    writeSafe(path.join(perPack, "x"));
    fs.rmSync(perPack, { recursive: true, force: true });
    if (fs.existsSync(legacy)) { writeSafe(legacy); fs.rmSync(legacy); }
    fs.mkdirSync(perPack, { recursive: true });
    words[role] = 0;
    for (const n of sel) {
      const text = packs.get(n).roles[role];
      if (!text) continue;
      const head = text.replace(/^# .*\n+/, "").trim();
      const ids = readOrder(text).filter((id) => all.has(id));
      const out = [`# ${role} · ${n}`, "", head, ...ids.flatMap((id) => ["", render(id, all.get(id))])].join("\n") + "\n";
      writeSafe(path.join(perPack, `${n}.md`), out);
      words[role] += prose(out);
    }
  }
  const skillsFile = path.join(foremanDir, "skills.json");
  const skills = fs.existsSync(skillsFile) ? JSON.parse(fs.readFileSync(skillsFile, "utf8")) : {};
  skills.packs = sel;
  skills.builtWith = VERSION;
  skills.roles = Object.fromEntries(ROLES.map((r) => [r, `.foreman/roles/${r}/`]));
  writeSafe(skillsFile, JSON.stringify(skills, null, 2) + "\n");
  const gotchas = importGotchas(db, sel.flatMap((n) => packs.get(n).gotchas.filter((g) => !g.bad)));
  return { packs: sel, words, gotchas };
}
