---
name: tidy
description: >
  This skill should be used when the user runs "/foreman:tidy", says "clean up this
  codebase", "remove dead code", "tidy this project", "this code is messy", "make this
  consistent", "get rid of the old way of doing X", or wants unused code, files and
  dependencies removed and small inconsistencies fixed in safe, verified batches. Structural
  refactors are planned into the backlog, not done here. For a full audit use
  /foreman:review; for one feature use /foreman:feature.
---

# /foreman:tidy [paths] — remove what's dead, align what's inconsistent, plan the rest

**Presentation**: render every user-facing block with `${CLAUDE_PLUGIN_ROOT}/skills/feature/references/style.md` (bold header and phase lines, inline-code gate rail, fenced roster and close block; no horizontal rules or box-drawing). Header `**⚒ foreman** · tidy · <scope>`; phases `◇ baseline`, `▤ find`, `? confirm`, `▣ tidy`, `◎ review`, `✎ remember`. One header and one close block.

`MEM` = `node --no-warnings ${CLAUDE_PLUGIN_ROOT}/scripts/memory.mjs` from the project root.

Removal over refactoring: delete before you restructure, and never add code to clean code up.

**Map first**: if `.foreman/project-map.md` does not exist, say so in one line (`⚒ no project map yet · running /foreman:map first`), run `/foreman:map` to completion, then carry on. If the map has no **House patterns** section, re-run `/foreman:map` first; tidying without them guesses which way is right.

## Steps

Workers inherit the scope exclusions in their agent files. When you pass explicit paths, pass source paths only.

1. **Preconditions**: read `project-map.md` (House patterns, Conventions, Design decisions, Risk areas), `stack-guide.md`, `config.json`, `rules.md`. Scope = the argument paths, else the whole project (for monorepos, ask which apps). The working tree must be clean (`git status --porcelain` empty apart from `.foreman/`); if not, ask the user to commit or stash first. Then create and switch to a branch `tidy/<scope>-<yyyy-mm-dd>`: every batch is one commit there, so any batch can be reverted alone and the user squashes or drops the branch when merging. Nothing is pushed.
2. **◇ baseline**: run `commands.typecheck`, `commands.lint`, `commands.test` (or `testSubset` for the scope) and `commands.build` once, from the main loop, output to `$TMPDIR`. Record pass/fail and counts. If anything already fails, show it and stop unless the user says to tidy anyway; a failing baseline makes every later check meaningless.
3. **▤ find**: dispatch one `auditor` (model `models.reviewer`) with area `cleanup`, the scope paths, the map (House patterns, Design decisions, Risk areas), the stack guide's Design section, and `MEM backlog list` titles so it extends rather than duplicates. For a large scope, split by app or top-level directory and dispatch one auditor per part in one message. Also take open backlog items in `architecture` with effort `s` that touch the scope.
4. **? confirm**: show counts per tier, then T1 as a compact list and T2 with one line each. Ask once (AskUserQuestion, multiSelect): `T1 safe deletes (n)`, `T2 small fixes (n)`. Anything in a Risk area, auth, payments, migrations or a public API is never T1; show it under T2 with a note. T2 items marked `[behaviour change]` get their own option (`T2 behaviour changes (n)`) and are listed with what changes; never fold them into the safe set. T3/T4 are never executed here.
5. **▣ tidy**, one batch at a time: T1 first, then T2, each split into batches of ≤10 files grouped by area. Every `[behaviour change]` item is a batch of its own, so reverting it never takes a safe fix with it.
   - Dispatch one `implementer` per batch in the main checkout (no worktrees; batches run one after another). Brief: the findings verbatim, "delete or align only; do not add features, files or abstractions; preserve behaviour except where a finding is marked `[behaviour change]`", house patterns with exemplars, the test-subset command. Remove unused dependencies with the package manager so the lockfile stays in step; never create a lockfile the project didn't have.
   - After each batch: `git diff --numstat`. A T1 batch with more lines added than removed, or a T2 batch whose finding didn't say it would grow, is a red flag: revert it and report.
   - Run `verifier` in `targeted` mode on the batch's files. `FAILED` → discard the batch (`git restore --worktree --staged .` and delete files it added; earlier batches are already committed), mark those findings as "not safe" and move on; never fix forward inside tidy.
   - Passed → `git add -A && git commit -m "tidy: <what this batch removed or aligned>"`.
   - For a `[behaviour change]` batch, the brief also asks for one test that pins the new behaviour (e.g. the error that now throws).
   - Max 6 batches per run; report the rest as remaining.
6. **◎ review**: once all batches are done, run `verifier` in `full` mode once, then `reviewer` on the whole tidy diff with requirements "behaviour unchanged except the approved `[behaviour change]` items (listed); only dead code removed and code aligned to house patterns". Blockers → `git revert` the offending batch's commit, don't patch it. Run `security-auditor` only if the diff touches a Risk area or Auth & trust path.
7. **✎ remember**:
   - `MEM feature start --title "tidy <scope>" --tags tidy` then `MEM feature finish <id> --outcome done|partial --summary "<n> removed, <n> aligned, <n> planned" --files <changed> --review <verdict>`.
   - T3/T4 findings and anything reverted: `MEM backlog add --area architecture --severity <sev> --effort <m|l> --plan "<steps>" --paths <paths>` (skip ones already in the backlog).
   - 0–3 lessons about why something looked dead but wasn't (`--kind gotcha`), or a pattern that keeps reappearing (`--kind convention`).
   - If a legacy pattern now has zero files left, remove its `legacy:` note from the map's House patterns.
   - `MEM export`.
8. **Close block**: the branch name, lines removed vs added, files deleted, batches passed/reverted, review verdict, items planned to the backlog with ids, next step (`/foreman:feature backlog #<id>` for the top T3).

## Red flags (stop and report)

- A batch would create new files or new abstractions.
- More than half the T1 findings turn out to be referenced after all: the finder is guessing; stop and lower confidence.
- The same file fails verification twice.
- The plan grows past 6 batches: tidy in smaller scopes instead.
