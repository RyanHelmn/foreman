---
name: check
description: >
  This skill should be used when the user runs "/foreman:check", "/foreman:check code",
  "/foreman:check security", says "review my branch", "fresh-eyes review before I open the
  PR", "security check this diff", "is this change safe", "review the staged changes", or
  wants an independent diff-level code review and/or security audit by subagents that have
  not seen the work being written. For a whole-project audit use /foreman:review.
---

# /foreman:check [code|security|both] [scope] — gates on demand

**Presentation**: render every user-facing block with `${CLAUDE_PLUGIN_ROOT}/skills/feature/references/style.md` (bold header and phase lines, inline-code gate rail, fenced roster and close block; no horizontal rules or box-drawing). One header and one close block per command.

Run the `reviewer` and/or `security-auditor` on a diff without a full feature run. Default: `both`.

**Map first**: if `.foreman/project-map.md` does not exist, say so in one line (`⚒ no project map yet · running /foreman:map first`), run `/foreman:map` to completion, then carry on with this command.

## Steps

Workers inherit the scope exclusions in their agent files (`.gitignore`d, dependency, build and cache directories are never read). When you pass explicit paths, pass source paths only.

1. **Scope**: `branch` (default when ahead of base: `git diff <base>...HEAD`, base = `main`/`master` or the argument), `staged` (`git diff --cached`), `last` (`git show HEAD`), or explicit paths.
2. **Context**: requirements from the argument, PR description, or commit messages (ask one question if unclear); conventions, decisions, Auth & trust and Risk areas from `.foreman/project-map.md`; `skills.json` role paths + `stack-guide.md`; `MEM relevant --paths <changed files>` for lessons that apply.
3. **Dispatch** (parallel, one message) using the brief templates in `${CLAUDE_PLUGIN_ROOT}/skills/feature/references/briefs.md`: `reviewer` (model `models.reviewer`) and/or `security-auditor` (model `models.security`). Do not pre-review the diff yourself.
4. **Present** both reports verbatim (they are concise), then offer: fix blockers/critical+high now (one implementer per unit in a worktree, one targeted verify, one delta re-check), or leave it.
5. If a finding is a reusable gotcha, store it: `MEM lesson add --kind gotcha --text "..." --paths ...`. Second opinion on request: run the reviewer again on the other tier (`sonnet` ⇄ `opus`) and show only disagreements.
