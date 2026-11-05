---
name: map
description: >
  This skill should be used when the user runs "/foreman:map", says "map this project",
  "set up foreman", "foreman init", "rebuild the project context", "refresh the project
  map", or when another foreman command finds no .foreman/project-map.md. It fingerprints
  the stack (any language or framework), maps the codebase, discovers and installs
  stack-specific skills via find-skills / npx skills, generates a stack guide for this
  project, asks about anything it is not confident on, and seeds memory.
metadata:
  version: "0.2.0"
---

# /foreman:map — build the project's context once, reuse it every run

**Presentation**: render every user-facing block with `${CLAUDE_PLUGIN_ROOT}/skills/feature/references/style.md` (header, phase banners, gate rail, roster, verdict lines, close block) in fenced code blocks. One header and one close block per command.

Outputs, all in `.foreman/` at the project root:

| File | Commit | Purpose |
|---|---|---|
| `project-map.md` | yes | What the project is, layout, data, auth/trust, commands, conventions, decisions, risk areas |
| `stack-guide.md` | yes | Practices + security checklist tailored to *this* stack (built-in sections + installed skills) |
| `config.json` | yes | Commands, models, test strategy, gates (`/foreman:config`) |
| `skills.json` | yes | Which skill files each worker role reads first |
| `rules.md` | yes | Project rules every session and worker follows (`/foreman:rules`) |
| `MEMORY.md` | yes | Human-readable export of memory; rebuilds `memory.db` |
| `memory.db`, `run.json` | no | SQLite memory and live run state |

`MEM` below means: `node --no-warnings ${CLAUDE_PLUGIN_ROOT}/scripts/memory.mjs`. Run it from the project root.

Say which phase is starting in one line each. Never skip Phase 4.

## Phase 1 — Fingerprint (parallel scouts)

Dispatch up to four `scout` agents (model `models.scout` from config if present, else `haiku`), one question each. Do not read the repo in the main context. Stacks are not assumed: scouts must identify whatever is there.

1. **Workspace & tooling** — repo shape (monorepo markers: `pnpm-workspace.yaml`, `turbo.json`, `nx.json`, `go.work`, Cargo workspace, Gradle multi-project), package manager/lockfile, language versions (`.nvmrc`, `.tool-versions`, `pyproject`, `go.mod`), formatter/linter, CI config, Docker/compose, env handling and validation.
2. **Apps & frameworks** — per app/package: language, framework and version, routing style, UI/styling, data-fetching/state, API docs (OpenAPI/Swagger, GraphQL schema, tRPC), mobile (Expo/RN, Flutter, SwiftUI, Compose), desktop (Electron/Tauri), workers/queues.
3. **Data & auth** — databases and ORMs/query builders, schema and migration location + command, caches/queues/search, auth library and session model, roles/tenancy, third-party integrations (payments, email, storage, commerce platforms, AI providers).
4. **Quality commands** — exact commands for build, typecheck, lint, unit, integration, e2e; how to run a subset; what CI actually runs; approximate suite duration.

## Phase 2 — Write the project map (lead)

Combine the briefs with `CLAUDE.md`, `README*`, `docs/`, ADRs, `CONTRIBUTING*`, and `git log --oneline -30`. Write `project-map.md` (≤1,500 words) with sections: **Summary · Stack (table) · Layout · Data · Auth & trust (incl. trust boundaries) · API surface · Commands · Conventions · Design decisions · Risk areas · Open questions**. Record the commit sha and date at the top.

## Phase 3 — Stack guide and skills

1. **Built-in sections**: `${CLAUDE_PLUGIN_ROOT}/skills/map/references/stack-practices.md` and `stack-security.md` are organised by ecosystem (generic principles first, then JS/TS, Python, Go, Rust, JVM, Ruby, PHP, .NET, mobile native, SQL/NoSQL, infra). Copy the **General** sections plus only the sections matching the detected stack into `.foreman/stack-guide.md`, under `## Practices` and `## Security`. Add a `## Project-specific` section with conventions observed in Phase 2 that the generic text doesn't cover.
2. **Skill discovery**: if a `find-skills` skill is available, use it; else run `npx skills find <query>` directly (skip if `npx` is unavailable or offline). Queries: for each major technology, `<tech>` and `<tech> security`; plus `code review`, `security audit`, `testing <runner>`. Vet: prefer official orgs and well-known maintainers, high install counts, recent updates; read the SKILL.md source; reject anything that runs arbitrary commands or is marketing. Present a shortlist with AskUserQuestion (multiSelect) grouped by role (implementer / verifier / reviewer / security). Install chosen ones into the project: `npx skills add <owner/repo@skill> -y`. No `-g` unless asked.
3. Write `skills.json`:

```json
{ "implementer": [".claude/skills/<name>/SKILL.md"], "verifier": [], "reviewer": [], "security": [],
  "guide": ".foreman/stack-guide.md" }
```

The guide is always passed to workers; installed skills are passed per role.

## Phase 4 — Confidence loop (mandatory)

List every assumption the map rests on, tagged **high / medium / low**. Resolve every medium/low that affects planning, testing or security with AskUserQuestion: ≤4 questions per round, most consequential first, options drawn from scout evidence. Repeat until none remain or the user says proceed. Typical: which test command CI really runs; multi-tenant or not; deprecated modules; auth roles; migration process; whether foreman may ever run e2e; branching/PR conventions.

Record each answer twice: in `project-map.md › Design decisions` tagged `[user-confirmed]`, and in memory: `MEM decision add --text "..." --area <area> --source user --confirmed 1`. Later runs never re-ask a stored decision.

## Phase 5 — Config, memory, finish

1. `MEM init` (creates the db; imports `MEMORY.md` if present).
2. Write `config.json` from `/foreman:config` defaults with the discovered commands; `testStrategy: "targeted-then-full"`, `e2e: false` unless the user said otherwise.
3. Ensure `.gitignore` has `.foreman/run.json`, `.foreman/memory.db`, `.foreman/memory.db-*`.
4. `MEM export`, then reply in ≤10 lines: stack summary, skills installed per role, decisions confirmed, and the next command: `/foreman:feature <task>` or `/foreman:review`.

## Re-running

On a project that already has `.foreman/`: re-fingerprint, diff against the existing map, keep every `[user-confirmed]` decision and all memory, regenerate the stack guide, only ask about things that changed, and run `npx skills check` for skill updates. Use this whenever the context feels stale or after large refactors.
