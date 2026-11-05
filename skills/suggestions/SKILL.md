---
name: suggestions
description: >
  This skill should be used when the user runs "/foreman:suggestions [focus]", says "what
  should we build next", "suggest features", "review the product vision", "where should
  this go", "expand on the vision", "give me feature ideas", or wants product-direction
  ideas grounded in the project and its foreman memory, stored as backlog items that
  /foreman:feature can execute. Not for code quality (use /foreman:review) or one task's
  plan (use /foreman:feature).
metadata:
  version: "0.1.0"
---

# /foreman:suggestions — review the vision, suggest what to build next, store the keepers

**Presentation**: render every user-facing block with `${CLAUDE_PLUGIN_ROOT}/skills/feature/references/style.md` in fenced code blocks. Header `⚒ foreman · suggestions · <project>`; phases `◇ gather`, `? confirm`, `◇ research`, `⚒ draft`, `▤ critique`, `✎ remember`. One header and one close block.

`MEM` = `node --no-warnings ${CLAUDE_PLUGIN_ROOT}/scripts/memory.mjs` from the project root.

**Map first**: if `.foreman/project-map.md` does not exist, say so in one line (`⚒ no project map yet · running /foreman:map first`), run `/foreman:map` to completion, then carry on with this command.

## Steps

1. **Preconditions**: read `.foreman/project-map.md`, `config.json`. Then load what the project already knows about itself:
   - `MEM feature list --limit 30`: what has been built, abandoned, and why.
   - `MEM decision list`: confirmed decisions, and every `product` decision starting `Rejected:`. Never re-suggest a rejected idea unless the user's focus asks for it.
   - `MEM backlog list --status all`: open `product` items are already suggested; extend or re-rank them, don't duplicate.

2. **Vision** (`◇ gather`): write a 5-line vision brief from the map, README, landing/marketing copy, docs, route and model names, and recent features: who it's for, the job it does, how it makes money (if it does), where it is now, and the direction recent work points. Mark each line `[evidence: path]` or `[inferred]`.

3. **Confirm** (`? confirm`): AskUserQuestion (≤4 per round) only for `[inferred]` lines that change what is worth building: target user, business model, stage (pre-launch / growing / mature), the constraint that matters most now (time, money, team, a deadline). Also ask the focus if none was given: grow users, retain/monetise, close gaps vs competitors, or open (expand the vision). Store answers: `MEM decision add --text "..." --area product`.

4. **Research** (`◇ research`, one message, parallel, model `models.scout`): 2–3 scouts, one question each, web search allowed:
   - 3–5 comparable products or direct competitors: what they ship that this doesn't, what users praise and complain about (reviews, forums, changelogs).
   - the category's table stakes vs differentiators for this user and stage.
   - (if the focus is open) adjacent jobs this user does right before or after using the product.
   Each returns ≤300 words with sources.

5. **Draft** (`⚒ draft`, lead): there is no target count. Zero is a valid answer, and a product that already does its job well should be told so. A suggestion only makes the draft if all of these hold:
   - **signal**: a concrete reason in evidence, citable (a gap competitors' users praise, a complaint, a half-built path in the repo, a stated goal or constraint). "Most apps have it" is not a signal.
   - **specific**: it could only have been written for this product. If the title would fit any app in the category, cut it.
   - **worth it**: a user of this product would notice and care, at a cost that fits the stage and constraint from step 3.
   - **new**: not built, not in the backlog, not rejected.
   Cut on any doubt. Generic ideas (dark mode, onboarding polish, "add AI", notifications, analytics dashboards, social sharing, gamification) are out unless the evidence names them specifically. Each survivor: title, the signal with its source, what it adds, effort `s|m|l` with paths from the map, and a 3–5 step plan. Mostly next steps on the current direction; at most 2 that expand it (new user, new job, new surface), labelled `expand`. If nothing survives, skip to step 7's empty case.

6. **Critique** (`▤ critique`): one `auditor` (model `models.reviewer`) with the vision brief, the research briefs, and the draft, briefed as a product critic: "for each suggestion, attack it: is the signal real, does it fit this user and stage, is it generic, is the effort honest, does it duplicate something built or rejected. Verdict per item: keep / sharpen (say how) / cut (say why). Default to cut: keep only what you would defend to the product's owner. Returning zero keepers is a good outcome when the draft is weak. Name a missed idea only if the evidence clearly supports it." Apply the verdicts; keep the critic's reasons.

7. **Choose**: if nothing survived, say so in ≤6 lines: the vision brief's one-line verdict ("does its job for <user>; nothing in the evidence points to a gap worth building now"), what was considered and why it was cut (one line each, max 5), and what would change the answer (a signal to watch for). Store nothing, close. Otherwise present the survivors ranked by value for effort, ≤25 lines: the vision brief (5 lines), then each suggestion as `#n title · effort · signal in one line`, `expand` ones last. AskUserQuestion (multiSelect, in batches of 4): which go to the backlog. For the ones not picked, ask once whether to remember them as rejected (so they don't come back) or leave them unrecorded.

8. **Remember** (`✎ remember`):
   - picked: `MEM backlog add --title "..." --area product --severity high|medium|low --plan "<steps>" --effort s|m|l --paths <paths>` (severity = priority: high for strong signal and low effort).
   - rejected: `MEM decision add --text "Rejected: <title> — <user's reason or critic's>" --area product`.
   - vision changes the user confirmed: append to the map's Design decisions as `[user-confirmed]`.
   - `MEM export`.

9. **Close**: the stored backlog ids, and how to act: `/foreman:feature backlog #<id>` builds one.

## Re-running

Later runs start from the stored vision decisions and product backlog: lead with what changed since last time (features shipped, items done or dismissed), re-rank open product items against new evidence, and add only new ideas.
