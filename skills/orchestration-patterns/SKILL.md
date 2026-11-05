---
name: orchestration-patterns
description: >
  This skill should be used when the user asks "should I use subagents for this", "how
  should I split this work", "single agent or multi-agent", "when to fold subagents in",
  "which model for which task", "why is foreman doing X", or asks about agent-teams,
  orchestrator-subagent, generator-verifier, dynamic workflows, or context-centric
  decomposition. It holds the reasoning behind foreman's design, distilled from
  Anthropic's published guidance, so the lead can make judgement calls rather than
  follow the loop blindly.
---

# Orchestration patterns — the reasoning behind foreman

Use this when deciding *whether* and *how* to delegate, not just *that* you should. Sources are listed in `references/sources.md`; the condensed guidance is below.

## 1. Default to one loop; delegate for three reasons only

A single agent with progressively disclosed skills and tools frequently beats both a giant prompt and a swarm of specialists on quality, cost and latency. Anthropic's Applied AI team saw enterprise deployments improve by folding routers, planners and domain subagents back into the main loop. Delegate only when:

- **Context would bloat** — a side task (deep search, log analysis, dependency audit) would fill the main window with intermediate results you'll never reference again.
- **Work is parallel** with fresh context per branch — independent research facets, independent components with clean interfaces.
- **Independent judgement** is needed — verification, review, security. A fresh instance can't be anchored by how the work was produced.

Foreman's scouts cover the first two; verifier/reviewer/security-auditor/auditor cover the third. Everything else stays with the lead.

## 2. Split by context, not by problem type

Agents split by role (planner → implementer → tester → reviewer) for one unit play a "telephone game": each handoff drops detail, and coordination costs more tokens than the work. Instead give each worker a slice that needs little from the rest of the system and returns a compact result. Define interfaces up front so parallel units can build against a contract.

## 3. The verification subagent is the pattern that reliably works

Verification needs minimal context transfer by nature: a verifier can black-box-test the system without the build history. Give it the requirements, the changed files, the commands, and a hard rule: never pass after a partial run. Stronger orchestrator models can self-evaluate more, but an explicit checkpoint is still worth it for anything that ships.

## 4. Progressive disclosure replaces most subagents

Skills (loaded when invoked) and tool search (tools loaded when needed) remove the main reason teams split work: a system prompt that would otherwise contain everything. Foreman's project map, `skills.json`, and the built-in stack references are this principle applied: workers get the slice of context they need, pasted into the brief, nothing more.

## 5. Model tiering

Match model to the judgement the task needs, not to its importance:
- Read-and-summarise, locate, extract → smallest model (Haiku).
- Write code against a clear brief, run tests → mid (Sonnet).
- Judge correctness, design, security; synthesise conflicting findings; plan → strongest (Opus / Fable).
- The lead stays on whatever the session runs; it holds the plan and talks to the user.
Route escalation on signal: the same failure twice → bigger model with full history.

## 6. Evals and "what flipped"

When you change the orchestration (fold a worker in, change a model), compare on a small end-to-end eval and look at which tasks **flipped**, not just the aggregate score — a faster setup can silently break a path that was passing. Foreman reports flipped tests between iterations for the same reason, and stores them on the feature record.

## 7. Bounded loops

Every loop has a cap (fix iterations, re-reviews, re-audits, stop-hook blocks). On exhaustion, stop and report rather than spend more. Agents that can't finish should say so with evidence; a clear "blocked" is a good result.

## 8. Choosing among Claude Code's parallel mechanisms

| Need | Use |
|---|---|
| A side task inside one session, result summarised back | subagents (what foreman uses) |
| Several independent tasks you'll check on later | agent view / separate sessions |
| Long-running peers that message each other and share a task list | agent teams (experimental) |
| Dozens–hundreds of agents with the plan held in a script, cross-checked results | dynamic workflows (`ultracode`, `/deep-research`) |

Foreman is deliberately the first row: one lead, bounded workers, hard gates. If a task outgrows it (500-file migration, codebase-wide audit), suggest a dynamic workflow instead of stretching foreman.

## 9. Human-agent working rules worth copying

- Agents get defined roles, the tools for the job, and a written scope (foreman's agent files).
- Trust expands with demonstrated reliability: review everything early, then widen autonomy per task type.
- Batch questions for the human; repeat key context when asking; limit what the human must look at.
- Keep a "lessons & missteps" trail — foreman's memory: every feature run ends by storing lessons, and every run starts by recalling them (`scripts/memory.mjs`). Memory holds what isn't re-derivable: decisions, gotchas, outcomes. Not transcripts, not search results.
