---
name: config
description: >
  This skill should be used when the user runs "/foreman:config", says "change foreman
  models", "set the reviewer to opus", "foreman settings", "turn off e2e in foreman",
  "how many fix iterations", or wants to see or change which model each foreman role uses,
  the test strategy, gate strictness, or worktree isolation.
---

# /foreman:config — per-project settings

**Presentation**: use `${CLAUDE_PLUGIN_ROOT}/skills/feature/references/style.md` — header `**⚒ foreman** · config`, settings as a short fenced two-column block, `(recommended)` tags.

Settings live in `.foreman/config.json` (project, committed). A user-level default file at `~/.claude/foreman.json` is used for any key the project file omits. Project wins over user; user wins over the built-in defaults below.

**Map first**: if `.foreman/project-map.md` does not exist, say so in one line (`⚒ no project map yet · running /foreman:map first`), run `/foreman:map` to completion, then carry on with this command.

## Defaults (recommended)

```json
{
  "models": {
    "scout": "haiku",
    "implementer": "sonnet",
    "verifier": "sonnet",
    "reviewer": "opus",
    "security": "opus"
  },
  "maxFixIterations": 3,
  "testStrategy": "targeted-then-full",
  "e2e": false,
  "worktrees": true,
  "gates": { "enforce": true, "maxBlocks": 3, "staleHours": 6 },
  "commands": {
    "build": null, "typecheck": null, "lint": null,
    "test": null, "testSubset": null, "testIntegration": null, "e2e": null,
    "audit": null
  },
  "limits": { "scoutWords": 300, "implementerWords": 250, "reviewerWords": 500, "securityWords": 600 },
  "memory": { "briefing": true, "recallLimit": 10 },
  "context": { "compactAt": 60 },
  "prices": {
    "haiku":  { "perMTok": 0.15, "currency": "GBP" },
    "sonnet": { "perMTok": 2.8,  "currency": "GBP" },
    "opus":   { "perMTok": 5.6,  "currency": "GBP" },
    "fable":  { "perMTok": 14,   "currency": "GBP" }
  },
  "routing": { "mode": "static", "threshold": 0.8, "minSamples": 5 }
}
```

`context.compactAt`: the context % at which foreman acts: during an active feature run it compacts between turns (keeping the run's state); after a foreman command has finished it suggests `/clear` in the status line instead. Other sessions are left to Claude Code. `false` turns it off.

`prices`: a blended price per million tokens for each model, used only for the estimates in `memory cost`, `feature list`, `feature report` and `MEMORY.md`. Keys are model aliases or full ids; a dispatch whose model is a full id (`claude-sonnet-5-5`) falls back to the alias it contains. The defaults are list prices (Nov 2026) blended at about 80% input / 20% output and converted to GBP. **Edit them** for your currency, plan, or cache-heavy usage; foreman doesn't split input from output.

`routing`: how `/foreman:feature` picks each implementer's model. `static` (recommended until you have evidence) always uses `models.implementer`. `evidence` asks `memory routing suggest` per unit: the cheapest model (by `prices`) whose first-pass rate for that task type in this repo is at least `threshold`, with at least `minSamples` judged dispatches here; otherwise `models.implementer`, labelled "insufficient evidence (n=N)". Local rates are blended with the plugin's `priors.json` as if each prior row were `n` extra samples, but only local samples count toward `minSamples`. The SessionStart briefing suggests switching once 10 finished features have dispatch records. `routing=evidence` / `routing=static` set the mode directly.

`worktrees`: `true` isolates implementers in git worktrees only when two or more run at once, and removes each one as soon as it is merged; `false` never uses worktrees.

Model values are the aliases the Agent tool accepts (`haiku`, `sonnet`, `opus`, `inherit`) or a full model id such as `claude-fable-5-1`. `inherit` means "whatever the main session runs on".

Why these defaults: scouts only read and summarise (Haiku is plenty and cheap); implementers and verifiers need solid code ability at volume (Sonnet); review and security are judgement calls where a stronger model catches what tests can't (Opus). Users who want the top tier for judgement can set `reviewer`/`security` to `claude-fable-5-1`; users optimising cost can set both to `sonnet`.

## Behaviour

1. **No arguments**: read the effective config (merge defaults ← user ← project), show it as a short table with a `(recommended)` tag on values that match defaults, and ask with AskUserQuestion which group to change: models, test strategy & e2e, gates, worktrees, commands, prices, routing. Offer the recommended value as the first option in every question.
2. **With arguments** like `reviewer=opus e2e=true maxFixIterations=2`: apply them directly.
3. Validate: model names must be aliases or `claude-` ids; `maxFixIterations` 1–5; `testStrategy` one of `targeted-then-full`, `full-only`, `targeted-only`; `gates.maxBlocks` 1–10; `prices.*.perMTok` a number ≥ 0 and `currency` a 3-letter code; `routing.mode` `static` or `evidence`, `routing.threshold` 0–1, `routing.minSamples` ≥ 1.
4. If `commands.*` are null and a project map exists, fill them from `.foreman/project-map.md` `## Commands` and confirm.
5. Write the file (create `.foreman/` if missing), then show the final effective config and one line on what changed.
6. `--user` flag (or "make this my default for all projects"): write to `~/.claude/foreman.json` instead.
7. **`statusline`** argument (or "set up the foreman status line"): install the live status line.
   - Copy `${CLAUDE_PLUGIN_ROOT}/scripts/statusline.sh` and `${CLAUDE_PLUGIN_ROOT}/scripts/memory.mjs` to `~/.claude/foreman/` (so the path survives plugin updates), `chmod +x` the script.
   - Read `~/.claude/settings.json` (create `{}` if missing). If a `statusLine` already exists, show it and ask before replacing. Set:
     `"statusLine": { "type": "command", "command": "bash ~/.claude/foreman/statusline.sh" }`
   - Tell the user it shows `⚒ foreman │ branch │ N open · M lessons │ ctx % │ model` (plus the feature id during a run); the live gate rail and workers are shown by foreman's mod under the prompt, so the two don't repeat each other, and that it appears on the next session (or after `/statusline` reload if available). `statusline off` removes the entry.

## Notes for the lead

- `/foreman:feature` passes `models.<role>` as the `model` argument on every Agent call; the agent files carry the recommended defaults so the plugin works with no config at all.
- `testStrategy`:
  - `targeted-then-full` (recommended): targeted on every iteration, full once at the end.
  - `targeted-only`: never run the full suite (fast feedback projects with slow suites; CI covers full).
  - `full-only`: full suite each iteration (small suites only).
- `gates.enforce=false` turns the Stop hook into a reminder instead of a block. `gates.staleHours` (default 6): a run older than this, or owned by another session, is reported but not enforced, so a crashed session can't block later ones.
- `memory.briefing=false` silences the SessionStart briefing; `memory.recallLimit` (default 10) caps recalled items injected into briefs.
