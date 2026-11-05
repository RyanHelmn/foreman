---
name: rules
description: >
  This skill should be used when the user runs "/foreman:rules [add <rule> | remove <n>]",
  says "add a rule", "foreman rules", "always/never do X in this project", "stop creating
  worktrees/databases/containers", "Claude keeps bloating the project", or wants a project
  rule that every Claude Code session and every foreman worker follows.
metadata:
  version: "0.1.0"
---

# /foreman:rules — project rules every session and worker follows

Rules live in `.foreman/rules.md` (committed, so the team shares them): a numbered markdown list, one imperative line per rule. They reach:
- every Claude Code session in the project, through foreman's SessionStart hook (not only foreman commands);
- every foreman worker brief, under PROJECT RULES, where they override the worker's defaults;
- the reviewer, which treats a violation as a blocker.

**Presentation**: header `**⚒ foreman** · rules · <project>`, then the numbered list in a fenced block. One close line.

**Map first**: if `.foreman/project-map.md` does not exist, say so in one line (`⚒ no project map yet · running /foreman:map first`), run `/foreman:map` to completion, then carry on with this command.

## Steps

1. Read `.foreman/rules.md` (missing → none yet; create `.foreman/` if needed). Skim the project's `CLAUDE.md` so you can flag rules that duplicate it.
2. **With `add <rule>`**: rewrite it as one short imperative line ("Never …", "Always …", "Ask before …") keeping the user's meaning, append it, show the list.
3. **With `remove <n>`**: remove it, renumber, show the list.
4. **No arguments**: show the list, then AskUserQuestion: add a rule, remove one, or add starter rules. With no rules yet, lead with the starters.
5. **Starter rules** (AskUserQuestion, multiSelect; tailor the wording to the stack in the map, e.g. name the actual database, compose file, or large data folder):
   - Reuse the database, containers and services already running; never create new ones or copies of data directories to experiment.
   - Remove agent worktrees and their branches as soon as their work is merged or abandoned.
   - In worktrees, never install from the network: symlink the main checkout's dependency folder (single-package repos) or run the offline/frozen install (monorepos with workspace packages).
   - Write build logs, diffs and scratch files to `$TMPDIR`, never into the repo.
   - Ask before anything that will write more than ~1 GB to disk.
6. Keep the file under 20 rules and each rule to one line; if one would duplicate `CLAUDE.md`, say so and ask which place it belongs.
7. Close with: rules apply from the next session start (or `/reload-plugins`) in normal sessions, and immediately to foreman commands.

## Format

```markdown
# Project rules

1. Reuse the running Postgres and docker compose services; never start new ones.
2. Remove agent worktrees and their branches as soon as their work is merged.
```
