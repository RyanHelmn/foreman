# foreman

Lightweight tiered orchestration for Claude Code, with project memory. One lead, cheap scouts, isolated implementers, three gates that run **once per run**, and a zero-dependency SQLite memory so every run starts warmer than the last.

Design is distilled from Anthropic's published guidance (sources in `skills/orchestration-patterns/references/sources.md`): delegate only for context isolation, parallelism and independent judgement; split by context, not by role; verify with a fresh instance; bound every loop; fold everything else into the main agent.

## Commands

```
/foreman:map                     map the project (any stack), install stack skills, generate a stack guide,
                                 ask until confident, seed memory — run first, re-run to rebuild context
/foreman:feature <task>          recall → gather → ask → plan → build (parallel worktrees) → verify → fix loop
                                 → review → security → store lessons
/foreman:review [areas] [paths]  whole-project audit (security, performance, architecture, testing, dx, deps,
                                 observability, accessibility) → ranked backlog with plans
/foreman:suggestions [focus]     review the product vision, research comparable products, suggest what to build
                                 next (or say nothing is worth it) → product backlog items
/foreman:rules [add|remove]      project rules every Claude Code session and foreman worker follows
                                 (e.g. no new databases or containers, clean up worktrees)
/foreman:check [code|security]   diff-level review and/or security audit on demand
/foreman:tidy [paths]            remove dead code, align stragglers to the house patterns in verified batches,
                                 plan bigger refactors into the backlog
/foreman:recall <query>          search memory: features, decisions, lessons, backlog
/foreman:research <question>     parallel Haiku scouts, compact answer
/foreman:config                  models per role, test strategy, gates, worktrees, memory
```

## Components

| Component | Purpose | Default model |
|---|---|---|
| `scout` | Read-only research, ≤300-word brief with `path:line` evidence | Haiku |
| `implementer` | One bounded unit in its own git worktree, ≤250-word report | Sonnet |
| `verifier` | Black-box tests/typecheck/lint; `targeted` per iteration, `full` once; never passes a partial run | Sonnet |
| `reviewer` | Independent diff review: correctness, fit, design, tests | Opus |
| `security-auditor` | Source→sink security gate using the stack guide + installed security skills | Opus |
| `auditor` | One-area whole-project audit (performance, architecture, testing, dx, deps, …) with plans | Opus |
| `SessionStart` hook | ~10-line memory briefing in mapped projects (zero tokens: shell + node) | — |
| `Stop` hook | Refuses to end a feature run while gates are pending; bounded; only in the owning session and within `gates.staleHours`; fails open | — |
| `hooks/status.ts` | Live line under the prompt for any foreman command (workers for map/review/research, gate rail during a feature, toasts when a gate passes or fails), and context handling: past `context.compactAt` (default 60%) it compacts between turns during a feature run, or suggests `/clear` once a foreman command has finished; every compaction keeps the run's state | — |
| `scripts/memory.mjs` | SQLite memory CLI (`node:sqlite`, FTS5 trigram), no npm install | — |
| `scripts/statusline.sh` | Coloured status line: branch, memory counts, context %, model (the mod shows the run); installed by `/foreman:config statusline` | — |

## Look

Every command speaks one visual language (`skills/feature/references/style.md`) designed for Claude Code's markdown renderer: a bold `⚒ foreman · …` header, bold phase lines (`◇ gather`, `▣ build`, `⚖ verify`…), a one-line inline-code gate rail (`build ● · verify ◐ · review ○ · security ○`), a fenced worker roster with per-role sigils (◇ scout ▣ implementer ⚖ verifier ◎ reviewer ⛨ security ▤ auditor), verdict lines, and a fenced close block. No horizontal rules or box-drawing, which render badly in the terminal. `/foreman:config statusline` installs a coloured Claude Code status line that tracks the live run (feature, gates, iteration, context %, model) and shows branch + memory counts when idle. The memory CLI is coloured on a TTY, plain when piped, JSON with `--json`.

## Memory

`.foreman/memory.db` holds four tables: **features** (what was built, outcome, iterations, what flipped, review/security verdicts), **lessons** (gotchas, conventions, patterns, process — tied to paths), **decisions** (`[user-confirmed]` answers from the confidence loops), **backlog** (ranked findings from `/foreman:review`). Full-text search across all of them.

Self-learning loop: `/foreman:feature` starts with `memory relevant` (lessons/decisions/backlog touching the task's paths and terms) and injects hits into worker briefs; it ends by storing the feature record and 0–5 specific lessons. `/foreman:review` writes the backlog; features close backlog items.

Git: the `.db` is ignored; `MEMORY.md` (human-readable + JSON snapshot) is regenerated on every finish/export and committed. A missing `.db` rebuilds from `MEMORY.md` automatically.

```
node --no-warnings <plugin>/scripts/memory.mjs briefing | recall <q> | feature list | backlog list | export | import
```

## Any stack

`/foreman:map` identifies whatever is there (JS/TS, Python, Go, Rust, JVM, Ruby, PHP, .NET, mobile native, Expo/RN, Flutter, SQL/NoSQL, infra) and writes `.foreman/stack-guide.md` from the matching sections of `skills/map/references/stack-practices.md` and `stack-security.md` plus any skills it installs from the open ecosystem (`npx skills find` / `find-skills`). The guide is handed to every worker; installed skills are handed per role via `skills.json`. The guide also carries `skills/map/references/design-principles.md` (composition and consistency rules for any language), and the map records one **house pattern** per concern (data access, errors, forms, state…) with an exemplar file, so implementers copy the right way, the reviewer flags a second way, and `/foreman:tidy` moves stragglers over.

## Token economy

- Verification: targeted per iteration, full once at the end, e2e only when enabled.
- Review and security: once after convergence; re-runs on the delta only.
- Workers return summaries, never transcripts. `maxFixIterations` (3) and `gates.maxBlocks` (3) cap every loop.
- Tasks ≤2 files are done in the main loop.

## Setup

1. Install the plugin. At the prompt of a Claude Code terminal session:

   ```
   /plugin install foreman --marketplace RyanHelmn/foreman
   ```

   Answer `y` to add the marketplace, then pick a scope (user is first). From a shell: `claude plugin install foreman --marketplace RyanHelmn/foreman`. In the desktop app: click + next to the prompt box → Plugins → Add marketplace `RyanHelmn/foreman` → Add plugin.
2. In a project: `/foreman:map`. Commit `.foreman/`; it ships its own `.gitignore` that excludes `memory.db*` and `run.json`, so the map, stack guide, config, skills map, rules and `MEMORY.md` are committed and the live state isn't.
3. Optional `/foreman:config` (e.g. `reviewer=claude-fable-5-1`, `e2e=true`; `--user` for global defaults).

Tests: `npm test` (Node's built-in runner, no dependencies) covers the stop gate and the memory CLI; the mod has its own `hooks/status.test.ts`.

Requirements: Claude Code with plugins, git (worktrees), Node ≥ 22.13 (built-in SQLite) for memory and the briefing hook; `npx` optional for skill discovery. No API keys, no native modules.

## Customising

Agent prompts live in `agents/`; the loop in `skills/feature/SKILL.md`; the knowledge in `skills/map/references/` and `skills/feature/references/`. Add your own stack section to the references and `/foreman:map` will pick it up on the next run.
