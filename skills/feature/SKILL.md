---
name: feature
description: >
  This skill should be used when the user runs "/foreman:feature <task>", says "foreman,
  build X", "use foreman for this", "ship this feature with foreman", or hands over a
  multi-file feature, refactor or bug fix to be done with tiered subagents, verification,
  review, a security gate, and memory of what was learned. Not for one-line fixes or
  questions.
---

# /foreman:feature — gather → ask → plan → build → verify → review → secure → remember

**Presentation**: render every user-facing block with `${CLAUDE_PLUGIN_ROOT}/skills/feature/references/style.md` (bold header and phase lines, inline-code gate rail, fenced roster and close block; no horizontal rules or box-drawing). One header and one close block per command.

You are the lead. You hold the plan and the user relationship; workers get briefs and return summaries. `MEM` = `node --no-warnings ${CLAUDE_PLUGIN_ROOT}/scripts/memory.mjs` run from the project root.

**Economy rules (non-negotiable)**

- Verification runs **once per iteration**, never after individual edits: `targeted` mode per iteration, `full` exactly once at the end, `e2e` only if `config.e2e` is true.
- Review and security run **once** after the fix loop converges; re-runs cover only the delta.
- Scouts ≤300 words, implementers ≤250; nobody returns transcripts.
- Split by context, not by role (`references/decomposition.md`). One implementer beats three when units share context.
- Bounded: `config.maxFixIterations` (default 3). On exhaustion, stop and report.
- Tasks ≤2 files with one concern: do them in the main loop with one targeted verify. Say so.

**Evidence logging** (CLI calls at phase boundaries only; never an extra worker run):

- Around every Agent call: `MEM dispatch start --feature <id> --iteration <run.json.iteration> --role scout|implementer|verifier|reviewer|security --model <model> --unit "<unit title>" --type <task_type> --paths <owned or changed files>` → keep the id; dispatch parallel calls' starts together before the Agent message. When it returns: `MEM dispatch finish <did> --outcome <status from the report>`, plus `--tokens N --tool-uses N --duration S` parsed from the Agent result footer (`N tool uses · N tokens · 1m 12s`) when present; without a footer pass only the outcome and the CLI times it. Scouts use `--type other` unless the question maps to one type.
- After every verifier, reviewer or security result: `MEM gate add --feature <id> --iteration <n> --gate verify|review|security --result <verdict> --count <findings> --categories <csv>` with categories from `type-error, test-fail, lint, convention, correctness, design, security-high, security-medium, security-low, flaky, env`.
- After every verifier report: `MEM dispatch mark-first-pass --feature <id> --iteration <n-1> --result <verdict> --failed-paths <files of the failing units, grouped as Phase 4 groups them>`. The verifier at iteration n judges the implementers dispatched at n-1. A failure you can't pin to files (suite-level, typecheck with no file) gets no `--failed-paths`, which marks nothing.

**Map first**: if `.foreman/project-map.md` does not exist, say so in one line (`⚒ no project map yet · running /foreman:map first`), run `/foreman:map` to completion, then carry on with this command.

## Phase 0 — Preconditions

1. Read `.foreman/config.json`, `project-map.md`, `skills.json`, `stack-guide.md`, and `rules.md` if present (paste its rules into every worker brief; they override your own judgement). If `package.json`/lockfile (or equivalent) changed since the map's commit, refresh the affected section with one scout.
2. Resolve `models.<role>` from config; pass each as the `model` argument on Agent calls.
3. **Recall**: `MEM relevant --text "<task>" --paths <likely paths>` and `MEM recall <key terms>`. Read the hits (lessons, decisions, similar features, open backlog items touching these paths). If a backlog item matches the task, note its id to close it at the end.
4. If `.foreman/run.json` already has `active: true`, ask whether to resume or abandon it. Resume: keep the file and its `featureId`, remove `sessionId`, set `started` to now, skip steps 5–6 and carry on from `next`. Abandon: as in "When things go wrong", then continue.
5. `MEM feature start --title "<task>" --tags <tags> --files <likely paths>` → keep the id.
6. Create `.foreman/run.json`:

```json
{ "active": true, "task": "<one line>", "featureId": <id>, "started": "<iso>", "iteration": 0,
  "phase": "understand", "next": "<the exact next step>", "plan": null,
  "changedFiles": [], "worktrees": [], "gates": { "verify": "pending", "review": "pending", "security": "pending" }, "blockCount": 0 }
```

The Stop hook refuses to end the session while gates are pending. Keep this file current: at every phase boundary write `phase`, `next` (the exact next step) and, once approved, `plan` (units with owned files, interfaces, done conditions; ≤15 lines). It is the checkpoint a compaction resumes from.

**Context**: while a run is active, foreman compacts between turns once context passes `context.compactAt` (default 60%), and every compaction is told to keep the run. Once a foreman command has finished, it suggests `/clear` instead, since everything is saved. After any compaction (a summary replaces the earlier conversation), re-read `.foreman/run.json` and carry on from `next`; don't redo finished phases.

## Phase 1 — Understand, then ask until confident

1. Restate the task: goal, scope, out of scope, done condition.
2. Pull context: map sections, recalled lessons/decisions, files the task obviously touches. Dispatch scouts (parallel, one question each) for anything unanswered: where the code lives, utilities to reuse, how similar features were done, which tests cover the area.
3. **Confidence loop**: list assumptions with high/medium/low confidence. Every medium/low that affects design, scope, data, auth or testing → AskUserQuestion (≤4 per round, options grounded in evidence). Repeat until none remain or the user says go. Store durable answers: `MEM decision add --text "..." --area <area>` and append to the map's Design decisions as `[user-confirmed]`.
4. **Confidence**: `MEM confidence --types <task types you expect> --paths <likely paths> --json` → write `{score, band, contributors}` to `run.json.confidence` and show it on the gate rail (`conf 0.72`). `band` sets the autonomy for this run against `config.autonomy`: `auto` (≥ `autoAt`), `normal`, or `ask` (< `askBelow`).

## Phase 2 — Plan

Show the plan in ≤15 lines: units (files owned, task type, interface, done condition, skills to read), dependencies (prefer none; define shared interfaces now), verification plan, risk areas, relevant lessons being applied. Give each unit one task type from `api, data-model, migration, ui, auth, test, refactor, config, infra, docs, other` and store it as `type` on the unit in `run.json.plan`. Implementer model: with `config.routing.mode = "evidence"`, run `MEM routing suggest --role implementer --type <type> --paths <unit files>` per unit and use its model, showing the basis in the plan (`implementer: opus (sonnet first-pass on migration 2/7 here)`); in `static` mode (default) use `models.implementer` as before. Ask for approval only for destructive migrations, public API changes, deletions, or new dependencies; otherwise proceed and say the user can interrupt. Band `ask`: always stop after the plan, list the confidence contributors (one line each), and wait for the go. Bands `auto` and `normal` follow the rule above. Create a task list (TaskCreate): one item per unit plus verify, review, security, merge, remember.

## Phase 3 — Implement (parallel, isolated)

Per unit, call `implementer` with the brief from `references/briefs.md`: unit, interface, owned files, done condition, pasted conventions, relevant lessons (`MEM relevant --paths <unit files>`), the test-subset/lint/typecheck commands, and skill files to read first (`skills.json.implementer` + `skills.json.guide`). Dispatch independent units in one message. Use `isolation: "worktree"` only when two or more units run at once (and `config.worktrees` is not false); a lone unit works in the main checkout. Record each worktree's path and branch in `run.json.worktrees`.

On return: `DONE` → add files to `run.json.changedFiles`, merge the worktree branch (resolve trivial conflicts yourself; otherwise one fresh implementer gets both sides), then remove it at once: `git worktree remove --force <path>`, `git branch -D <branch>`, and drop it from `run.json.worktrees`. `BLOCKED` → scope question → ask user; missing interface → define and re-dispatch. `PARTIAL` → fix-loop input.

## Phase 4 — Verify → fix loop

1. `iteration++`. Call `verifier` in `targeted` mode with requirements, `changedFiles`, commands, `skills.json.verifier`. Minimal context by design.
2. `PASSED` → step 4. `INCONCLUSIVE` → fix the environment issue, re-run once.
3. `FAILED` → group failures by unit; one implementer per group (worktree only if several groups run at once; remove after merge) with the failure report verbatim, the files, the violated requirement, "fix only this". Merge, loop to 1. At `maxFixIterations`, stop and report with the failure history. Same failure twice with the same hypothesis → escalate that fix to `models.reviewer` with full history.
4. Run `verifier` once in `full` (+`e2e` if enabled). One extra fix iteration allowed if it fails; then stop.
5. `gates.verify = "passed"`. Record what **flipped** between iterations (fixed / newly broken).

## Phase 5 — Review (≤1 re-review)

`reviewer` on `git diff <base>...HEAD` with requirements, conventions, decisions, `skills.json.reviewer`. `REQUEST_CHANGES` → blockers/should-fixes to implementers, merge, one targeted verify, re-review the delta once. Trivial nits: apply yourself; others: list for the user. `gates.review = "passed"`.

Band `auto` only, after an APPROVE: apply the reviewer's should-fixes yourself when every one of these holds: the item is under **Should-fix** and tagged `[convention]` or `[lint]` (never `[correctness]` or `[design]`), it touches only files already in `run.json.changedFiles`, and `commands.testSubset` is set. Then run `commands.testSubset` and `commands.typecheck` once on the touched files (Bash, no verifier agent). Green → `MEM gate add --feature <id> --iteration <n> --gate review --result APPROVE --count <applied> --categories auto-applied,<categories>`; red → revert those edits and list them. Anything that fails a condition is listed, as in the other bands.

## Phase 6 — Security gate (once)

`security-auditor` with `changedFiles`, diff, the map's Auth & trust + Risk areas, `skills.json.security` + guide. `FAIL` → fix, targeted verify, re-audit delta once. `PASS_WITH_FINDINGS` → fix cheap mediums, list the rest. `gates.security = "passed"` on PASS / PASS_WITH_FINDINGS only.

## Phase 7 — Remember and close

1. **Lessons** (this is what makes the next run better). From verifier failures, reviewer blockers, security findings, blockers, merge conflicts and anything that surprised you, write 0–5 lessons — specific and reusable, never a changelog:
   `MEM lesson add --feature <id> --kind gotcha|convention|pattern|process --text "..." --paths <paths>`
   Good: "Prisma `$transaction` with interactive callbacks times out under the default 5s on bulk imports; pass `{ timeout }`". Bad: "added a transaction".
2. `MEM feature finish <id> --outcome done|partial --summary "<2 lines>" --files <changedFiles> --iterations <n> --flipped "<...>" --review <verdict> --security <gate>`
   (this also regenerates `MEMORY.md`). If a backlog item was addressed: `MEM backlog update <bid> --status done --feature <id>`.
   Then `MEM feature report <id>` (writes `.foreman/reports/<id>.md`, committed) and `MEM cost <id>` for the close block.
3. **Clean up**: remove every worktree and branch still in `run.json.worktrees`, then `git worktree prune`. Set `run.json.active = false`.
4. Report ≤20 lines: what was built, files, verification + what flipped, review verdict + leftover nits, security gate + open findings, iterations used, lessons stored, one next step (open PR / run e2e / deploy). The close block gets one cost line: `cost     182k tok · £0.84 est · report .foreman/reports/12.md` (omit the tokens and cost when none were recorded).
5. If a new convention emerged, append it to the map's Conventions.

## When things go wrong

- Worker returns a transcript → don't read it; re-dispatch with "return only the output format".
- User interrupts → write state to `run.json`, summarise, ask.
- Budget concern → report worker-call count; offer to stop after the next gate.
- Abandoning → `MEM feature finish <id> --outcome abandoned --summary "<why>"`, clean up as in Phase 7 step 3, `run.json.active = false`, say which gates were skipped.
