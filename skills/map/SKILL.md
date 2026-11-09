---
name: map
description: >
  This skill should be used when the user runs "/foreman:map", says "map this project",
  "set up foreman", "foreman init", "rebuild the project context", "refresh the project
  map", or when another foreman command finds no .foreman/project-map.md. It fingerprints
  the stack (any language or framework), maps the codebase, discovers and installs
  stack-specific skills via find-skills / npx skills, selects stack packs and builds per-role
  rules for this project, asks about anything it is not confident on, and seeds memory.
---

# /foreman:map — build the project's context once, reuse it every run

**Presentation**: render every user-facing block with `${CLAUDE_PLUGIN_ROOT}/skills/feature/references/style.md` (bold header and phase lines, inline-code gate rail, fenced roster and close block; no horizontal rules or box-drawing). One header and one close block per command.

Outputs, all in `.foreman/` at the project root:

| File | Commit | Purpose |
|---|---|---|
| `project-map.md` | yes | What the project is, layout, data, auth/trust, commands, conventions, decisions, risk areas |
| `stack-guide.md` | yes | Project-specific conventions the packs don't cover |
| `roles/*.md` | yes | Stack rules per worker role, built from the selected packs (`scripts/packs.mjs build`) |
| `config.json` | yes | Commands, models, test strategy, gates (`/foreman:config`) |
| `skills.json` | yes | Selected packs, role files, and installed skill files per worker role |
| `rules.md` | yes | Project rules every session and worker follows (`/foreman:rules`) |
| `MEMORY.md` | yes | Human-readable export of memory; rebuilds `memory.db` |
| `memory.db`, `run.json` | no | SQLite memory and live run state |

`MEM` below means: `node --no-warnings ${CLAUDE_PLUGIN_ROOT}/scripts/memory.mjs`. Run it from the project root.

Say which phase is starting in one line each. Never skip Phase 4.

## Phase 1 — Fingerprint (parallel scouts)

Dispatch up to five `scout` agents (model `models.scout` from config if present, else `haiku`), one question each. Do not read the repo in the main context. Stacks are not assumed: scouts must identify whatever is there.

Tell every scout to enumerate with `git ls-files` (falling back to `rg --files`, which honours `.gitignore`) and to stay out of dependency, build and cache directories (`node_modules`, `.venv`, `dist`, `.next`, `target`, `vendor`, …); only their *presence* is a signal. Lockfiles identify the package manager by name; never read them. The layout section of the map lists source directories only; generated and vendored paths go in one line under Conventions as "ignored".

1. **Workspace & tooling** — repo shape (monorepo markers: `pnpm-workspace.yaml`, `turbo.json`, `nx.json`, `go.work`, Cargo workspace, Gradle multi-project), package manager/lockfile, language versions (`.nvmrc`, `.tool-versions`, `pyproject`, `go.mod`), formatter/linter, CI config, Docker/compose, env handling and validation.
2. **Apps & frameworks** — per app/package: language, framework and version, routing style, UI/styling, data-fetching/state, API docs (OpenAPI/Swagger, GraphQL schema, tRPC), mobile (Expo/RN, Flutter, SwiftUI, Compose), desktop (Electron/Tauri), workers/queues.
3. **Data & auth** — databases and ORMs/query builders, schema and migration location + command, caches/queues/search, auth library and session model, roles/tenancy, third-party integrations (payments, email, storage, commerce platforms, AI providers).
4. **Quality commands** — exact commands for build, typecheck, lint, unit, integration, e2e; how to run a subset; what CI actually runs; approximate suite duration.
5. **House patterns** — for each concern that exists here (data access, API calls, error handling, validation, config/env, logging, state, forms, UI components, styling, tests): how this codebase does it, with one exemplar `path` that shows it done well. Where a shared helper or module exists for a concern (an API client, a logger, an error wrapper), code that reimplements it instead of calling it is a second way, even if it looks similar. Where two or more ways coexist, list each with a file count and an example, and note which is newer (git log on the exemplars).

## Phase 2 — Write the project map (lead)

Combine the briefs with `CLAUDE.md`, `README*`, `docs/`, ADRs, `CONTRIBUTING*`, and `git log --oneline -30`. Write `project-map.md` (≤1,500 words) with sections: **Summary · Stack (table) · Layout · Data · Auth & trust (incl. trust boundaries) · API surface · Commands · Conventions · House patterns · Design decisions · Risk areas · Open questions**. House patterns is one line per concern: `<concern>: <the one way> · e.g. <exemplar path>`, plus `legacy: <the other way>` where a second way still exists. Record the commit sha and date at the top.

## Phase 3 — Packs, stack guide and skills

`PACKS` below means `node --no-warnings ${CLAUDE_PLUGIN_ROOT}/scripts/packs.mjs --root .`.

1. **Detect packs**: `PACKS detect --json` matches the bundled packs (`${CLAUDE_PLUGIN_ROOT}/packs/`) against the repo's manifests and files, adds what they extend, and orders them `_general` → languages → frameworks → libraries. Compare with the scouts' stack findings: a detected pack for tech the project doesn't really use is dropped (a stray dependency; `swift`/`android` picked up by the generated native folders of a Flutter or React Native app); tech the scouts found that no pack covers is listed for step 2. Ask only if a call is unclear (AskUserQuestion, which packs to keep).
2. **Skill discovery, only for tech no pack covers**: if a `find-skills` skill is available, use it; else run `npx skills find <query>` directly (skip if `npx` is unavailable or offline). Queries: `<tech>` and `<tech> security`. Vet: prefer official orgs and well-known maintainers, high install counts, recent updates; read the SKILL.md source; reject anything that runs arbitrary commands or is marketing. Present a shortlist with AskUserQuestion (multiSelect) grouped by role (implementer / verifier / reviewer / security). Install chosen ones into the project: `npx skills add <owner/repo@skill> -y`. No `-g` unless asked.
3. Write `skills.json` with the installed skills per role:

```json
{ "implementer": [".claude/skills/<name>/SKILL.md"], "verifier": [], "reviewer": [], "security": [],
  "guide": ".foreman/stack-guide.md" }
```

4. **Build roles**: `PACKS build --packs <the confirmed list>`. It writes `.foreman/roles/{implementer,reviewer,security,verifier}.md` (each selected pack's role file plus the full text of the rules it names), adds `packs` and `roles` to `skills.json`, and imports the packs' seed gotchas as lessons once (a lesson the user deletes is never re-imported). Show the per-role word counts it prints.
5. **Stack guide**: write `.foreman/stack-guide.md` with only `## Project-specific`: conventions observed in Phase 2 that the role files don't cover, and anything a selected pack says that this project deliberately does differently (the guide wins for this project).

Workers get their role file, the guide and their installed skills. Nothing from a pack is loaded at session start.

## Phase 4 — Confidence loop (mandatory)

List every assumption the map rests on, tagged **high / medium / low**. Resolve every medium/low that affects planning, testing or security with AskUserQuestion: ≤4 questions per round, most consequential first, options drawn from scout evidence. Repeat until none remain or the user says proceed. Always ask which way wins wherever two house patterns compete for one concern (options: each way, with its file count and exemplar). Typical: which test command CI really runs; multi-tenant or not; deprecated modules; auth roles; migration process; whether foreman may ever run e2e; branching/PR conventions.

Record each answer twice: in `project-map.md › Design decisions` tagged `[user-confirmed]`, and in memory: `MEM decision add --text "..." --area <area> --source user --confirmed 1`. Later runs never re-ask a stored decision.

## Phase 5 — Config, memory, finish

1. `MEM init` (creates the db; imports `MEMORY.md` if present).
2. Write `config.json` from `/foreman:config` defaults with the discovered commands; `testStrategy: "targeted-then-full"`, `e2e: false` unless the user said otherwise.
3. `MEM init` also writes `.foreman/.gitignore` (ignores `memory.db*` and `run.json`), so the project's own `.gitignore` needs no changes; confirm it exists.
4. `MEM export`, then reply in ≤10 lines: stack summary, skills installed per role, decisions confirmed, and the next command: `/foreman:feature <task>` or `/foreman:review`.

## Re-running

On a project that already has `.foreman/`: re-fingerprint, diff against the existing map, keep every `[user-confirmed]` decision and all memory, re-run pack detection and `PACKS build` (a new stack picks up its pack; deleted gotchas stay deleted), refresh the stack guide, only ask about things that changed, and run `npx skills check` for skill updates. Use this whenever the context feels stale or after large refactors.
