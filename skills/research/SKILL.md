---
name: research
description: >
  This skill should be used when the user runs "/foreman:research <question>", says "fan
  out scouts", "research this in parallel", "map how X works in this codebase", "find
  everything about Y", or asks a question whose answer requires reading many files or
  sources and would bloat the main conversation.
---

# /foreman:research — parallel cheap research, compact answer

**Presentation**: render every user-facing block with `${CLAUDE_PLUGIN_ROOT}/skills/feature/references/style.md` (bold header and phase lines, inline-code gate rail, fenced roster and close block; no horizontal rules or box-drawing). One header and one close block per command.

Use `scout` agents (model from config `models.scout`, default `haiku`) to answer a question without pulling raw files into the main context.

**Map first**: if `.foreman/project-map.md` does not exist, say so in one line (`⚒ no project map yet · running /foreman:map first`), run `/foreman:map` to completion, then carry on with this command.

## Steps

Workers inherit the scope exclusions in their agent files (`.gitignore`d, dependency, build and cache directories are never read). When you pass explicit paths, pass source paths only.

1. Split the question into 2–5 independent facets. If it cannot be split, use one scout. Facets must not depend on each other's answers; if they do, run the prerequisite first, then the rest in parallel.
2. Dispatch all independent scouts in one message using the scout brief template (`${CLAUDE_PLUGIN_ROOT}/skills/feature/references/briefs.md`). Include `START HERE` paths from `.foreman/project-map.md`.
3. Synthesise: answer the user's question directly in ≤12 lines, keep the `path:line` evidence, list uncertainties the scouts flagged. Do not paste the briefs.
4. If a facet came back with "unknown", decide whether a second, narrower scout is worth it; ask the user if it would need more than two more calls.
5. If the answer is a durable fact about the project (a convention, where something lives, a decision), offer to store it: `node --no-warnings ${CLAUDE_PLUGIN_ROOT}/scripts/memory.mjs decision add --text "..."` (or `lesson add`), and append to the project map.
