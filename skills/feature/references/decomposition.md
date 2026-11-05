# Decomposing work for implementers

Distilled from Anthropic's guidance on multi-agent systems: split by **context**, not by **problem type**.

## The rule

Give each worker a slice of work that needs little from the rest of the system and can hand back a compact result. If two slices need the same files, the same state, or each other's output, they are one slice.

## Good boundaries

- Independent components with a clean interface (a migration + repository method; a UI screen; an API route; a worker job)
- Separate packages/apps in a monorepo
- Independent research questions
- Black-box verification (the verifier never needs to know how the code was written)

## Bad boundaries (the "telephone game")

- Planner → implementer → tester → reviewer as separate *workers for one unit*: each handoff loses detail and coordination costs more than the work. Roles are fine as gates (that is what foreman does) but not as a pipeline for a single change.
- Splitting one feature by file type (all models to one worker, all controllers to another) when they must agree on shapes.
- Routers/classifiers/planners as separate agents: fold them into the lead's plan.

## Defining interfaces up front

When unit B depends on unit A's output, do not sequence them. Define the interface in the plan (TypeScript types, function signatures, route + DTO, schema fields) and give it to both. Both build against the contract; the verifier catches mismatches.

## Sizing

- One implementer: 1–6 files, one concern, done in one sitting
- If a unit has >8 files or two concerns, split it
- If the whole task is ≤2 files, don't orchestrate; do it in the main loop

## Parallelism

Dispatch all independent units in one message so they run concurrently. Worktrees keep them from clashing. The lead merges; conflicts are rare if file ownership was disjoint.

## When to fold back into the lead

After a few runs on a project, if a particular unit type always runs alone and always needs the lead's full context, it is cheaper to do it in the main loop. Reach for workers when: context would bloat the main session, work is parallel, or independent judgement is needed (verify, review, security).
