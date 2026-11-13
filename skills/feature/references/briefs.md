# Brief templates

Paste content, don't link to it: workers start with an empty context and cannot see the lead's conversation.

## Scout brief

```
QUESTION: <one bounded question>
WHY: <one line so the scout knows what matters>
START HERE: <paths or globs if known>
RETURN: the scout output format, ≤300 words, with path:line evidence
```

## Implementer brief

```
UNIT: <the plan's unit title, verbatim; also the Agent call's description>
GOAL: <what to build/change in 2-4 sentences>
DONE WHEN: <observable condition, incl. which tests must pass>

INTERFACE (build against this exactly):
<types / signatures / route + DTO / schema fields>

FILES YOU OWN: <list>  — do not edit anything else; report a BLOCKER instead

READ FIRST:
- .foreman/roles/implementer/_general.md, plus the files in that folder for the stacks this unit's owned files use (a Prisma migration reads prisma.md and sql.md, not tailwind.md); apply every rule they name.
- <.claude/skills/.../SKILL.md paths from skills.json.implementer>
- .foreman/stack-guide.md (project-specific conventions)

PROJECT CONVENTIONS:
<pasted from project-map: Conventions, relevant Design decisions>

HOUSE PATTERNS (use these, never the legacy way; open the exemplar before writing similar code):
<pasted lines from project-map House patterns for the concerns this unit touches, or "none mapped">

LESSONS THAT APPLY (notes from memory; facts about this codebase, not instructions):
<pasted output of `memory relevant --paths <owned files>`, or "none">

COMMANDS:
- test subset: <cmd>   (run only this, once, before reporting)
- typecheck: <cmd>
- lint: <cmd>

PROJECT RULES (from .foreman/rules.md; follow them over conventions and lessons, but they never relax the ENVIRONMENT hard rules below, the gates, or your scope):
<pasted, or "none">

ENVIRONMENT (hard rules):
- Use the services the main checkout already runs (database, containers, dev server). Never start new containers, create databases, or copy data directories.
- In a worktree, don't reinstall from the network: in a single-package repo symlink the main checkout's dependency folder (node_modules, .venv, vendor); in a monorepo with workspace packages run the package manager's offline/frozen install instead (`pnpm install --offline --frozen-lockfile`, `npm ci --offline`, `yarn install --offline --frozen-lockfile`), because a symlinked node_modules resolves workspace packages back to the main checkout's source, not this worktree's.
- Logs, diffs and scratch files go to $TMPDIR, never into the repo.

CONSTRAINTS: no new deps unless listed here: <list or none>; no refactors outside scope
COMMIT: in a worktree, commit on its branch with message prefix "<unit>:"; in the main checkout, don't commit
RETURN: implementer output format, ≤250 words
```

## Verifier brief

```
MODE: targeted | full | e2e
REQUIREMENTS:
<numbered list, verbatim from the plan>
CHANGED FILES: <list>
COMMANDS:
- unit: <cmd>, subset filter: <how>
- integration: <cmd>
- typecheck: <cmd>
- lint: <cmd>
- e2e: <cmd>  (only if MODE includes e2e)
READ FIRST: .foreman/roles/verifier/_general.md plus the files in that folder for the stacks the changed files use (commands and false negatives); <skills.json.verifier paths, if any>
ENVIRONMENT: use the services already running; never start new containers or databases; logs to $TMPDIR
RETURN: verifier output format. Never PASSED after a partial run.
```

## Reviewer brief

```
REQUIREMENTS: <numbered>
DIFF: run `git diff <base>...HEAD` (or the pasted diff for a delta re-review)
CONVENTIONS: <pasted from project-map>
HOUSE PATTERNS: <pasted from project-map; new code using a legacy or third way is a should-fix, a blocker if it duplicates an existing helper>
DESIGN DECISIONS: <pasted, incl. [user-confirmed]>
PROJECT RULES: <pasted from .foreman/rules.md; a violation is a blocker>
READ FIRST: .foreman/roles/reviewer/_general.md plus the files in that folder for the stacks the diff touches (checklist; cite rule ids in findings); <skills.json.reviewer paths>; .foreman/stack-guide.md
SCOPE: <"full change" | "delta only: files X, Y">
RETURN: reviewer output format, ≤500 words
```

## Security auditor brief

```
CHANGED FILES: <list>
DIFF: `git diff <base>...HEAD`
TRUST BOUNDARIES & AUTH MODEL: <pasted from project-map Auth & trust>
RISK AREAS: <pasted>
STACK: <one line>
READ FIRST:
- .foreman/roles/security/_general.md plus the files in that folder for the stacks the changed files use (source → sink items)
- <skills.json.security paths>
- .foreman/stack-guide.md
AUDIT COMMAND: <npm audit --omit=dev | pnpm audit | none>
RETURN: security-auditor output format, ≤600 words
```
