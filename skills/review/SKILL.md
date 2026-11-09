---
name: review
description: >
  This skill should be used when the user runs "/foreman:review", says "review the whole
  project", "what should we improve", "audit the codebase", "where are the risks",
  "give me a plan for hardening/optimising this", or wants a prioritised improvement plan
  across security, performance, architecture, testing, DX, dependencies, observability or
  accessibility, stored as a backlog that /foreman:feature can execute item by item.
  For reviewing a diff, use /foreman:check instead.
---

# /foreman:review — audit the project, produce a ranked plan, store it

**Presentation**: render every user-facing block with `${CLAUDE_PLUGIN_ROOT}/skills/feature/references/style.md` (bold header and phase lines, inline-code gate rail, fenced roster and close block; no horizontal rules or box-drawing). One header and one close block per command.

`MEM` = `node --no-warnings ${CLAUDE_PLUGIN_ROOT}/scripts/memory.mjs` from the project root.

**Map first**: if `.foreman/project-map.md` does not exist, say so in one line (`⚒ no project map yet · running /foreman:map first`), run `/foreman:map` to completion, then carry on with this command.

## Steps

Workers inherit the scope exclusions in their agent files (`.gitignore`d, dependency, build and cache directories are never read). When you pass explicit paths, pass source paths only.

1. **Preconditions**: read `.foreman/project-map.md`, `stack-guide.md`, `skills.json`, `config.json`. `MEM backlog list --status all` to know what is already tracked (don't re-add; update instead).
2. **Scope**: from the argument or AskUserQuestion (multiSelect): areas — `security`, `performance`, `architecture`, `testing`, `dx`, `deps`, `observability`, `accessibility`; and paths (default: whole project; for monorepos offer per-app). Default selection: security, performance, architecture, testing, deps.
3. **Dispatch in parallel, one message**: `security-auditor` for security (brief: whole scope, trust boundaries + risk areas from the map, `skills.json.roles.security` + `skills.json.security` + guide, audit command, "repo mode: report top findings with plans, cap 8"); one `auditor` per other area (model `models.reviewer`), each with: area, scope paths, the map, `skills.json.roles.reviewer` (stack rules), `skills.json.reviewer`, and the existing backlog titles so they extend rather than duplicate.
4. **Merge** (lead): dedupe overlapping findings, resolve conflicts between areas (e.g. a performance cache that widens a security surface — keep both, note the tension), and rank globally by severity then effort (`critical/high + s` first). Keep the plan each auditor wrote; tighten wording only.
5. **Store**: for each finding, `MEM backlog add --title "..." --area <area> --severity <sev> --plan "<steps>" --effort s|m|l --paths <paths>`. Existing items that an auditor re-found: leave as is; items that are no longer true: `MEM backlog update <id> --status dismissed`.
6. **Present** ≤25 lines: overall health per area (good/fair/needs work), the top 5 items with ids, counts by severity, and how to act: `/foreman:feature backlog #<id>` executes one; "do the quick wins" dispatches all `s`-effort high/critical items as one feature run with units per item.
7. `MEM export` so `MEMORY.md` carries the backlog.

## Re-running

Re-audits compare against the existing backlog: new findings are added, resolved ones are marked done (with the feature id if `/foreman:feature` closed them), and the summary leads with what changed since last time.
