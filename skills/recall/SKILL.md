---
name: recall
description: >
  This skill should be used when the user runs "/foreman:recall <query>", asks "what did
  we decide about X", "have we done something like this before", "what lessons do we have
  on Y", "show the backlog", "what features has foreman shipped", "why did we choose Z",
  or wants to search foreman's project memory of features, decisions, lessons and backlog.
metadata:
  version: "0.2.0"
---

# /foreman:recall — search project memory

**Presentation**: render every user-facing block with `${CLAUDE_PLUGIN_ROOT}/skills/feature/references/style.md` (header, phase banners, gate rail, roster, verdict lines, close block) in fenced code blocks. One header and one close block per command.

`MEM` = `node --no-warnings ${CLAUDE_PLUGIN_ROOT}/scripts/memory.mjs` from the project root. If `.foreman/memory.db` is missing but `MEMORY.md` exists, `MEM init` rebuilds it automatically.

**Map first**: if `.foreman/project-map.md` does not exist, say so in one line (`⚒ no project map yet · running /foreman:map first`), run `/foreman:map` to completion, then carry on with this command.

## Steps

1. Pick the query shape:
   - free text → `MEM recall <query>` (full-text across features, lessons, decisions, backlog)
   - "backlog" / "what's open" → `MEM backlog list [--status all]`
   - "decisions" → `MEM decision list`
   - "lessons" → `MEM lesson list`
   - "features" / "what has foreman done" → `MEM feature list`; details with `MEM feature show <id>`
   - "stats" / "briefing" → `MEM briefing` or `MEM stats`
2. Answer the user's question directly from the results in ≤12 lines; show ids so they can act (`/foreman:feature backlog #id`, `MEM feature show id`). Don't paste raw dumps.
3. If the user corrects a decision ("we moved off X"), add the new one (`MEM decision add`), note the superseded id in its text, and update the map's Design decisions. Never silently drop history.
4. If the user asks to remember something, store it in the right table: a standing choice → decision; a gotcha/pattern → lesson; a thing to do → backlog. Then `MEM export`.
