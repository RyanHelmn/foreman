# Pack schema

A pack is stack knowledge for foreman's existing roles: rules, plus four role files that say which rules each role applies. It is never an agent and never loads at session start. `/foreman:map` selects packs for the project (`node scripts/packs.mjs detect`), and `packs.mjs build` writes `.foreman/roles/<role>.md`: for each selected pack in precedence order, the pack's role file, then the full text of the rules its `Read order` names. Workers get that one file in their brief.

`node scripts/packs.mjs lint` enforces everything marked **(lint)**. It runs in `npm test`.

## Layout

```
packs/<name>/
  pack.json                 manifest
  _sections.md              section order and impact for this pack            (lint: exists)
  rules/<id>.md             one rule each                                      (lint: file name = id)
  roles/implementer.md      which rules apply when writing; deviation rules; output additions; obstacles
  roles/reviewer.md         ordered checklist; what is a blocker vs should-fix here
  roles/security.md         source→sink items for this stack; audit commands
  roles/verifier.md         subset / full / e2e commands; known false negatives
  gotchas.md                seed lessons, imported into memory once
```

Role files are optional per pack (a styling pack may have no security file). Rules are optional for a pack that only adds commands or obstacles.

## pack.json

```json
{ "name": "nestjs", "prefix": "nest", "layer": "framework", "version": "1.0.0",
  "extends": ["typescript", "node"],
  "detect": { "deps": ["@nestjs/core"], "files": ["nest-cli.json"], "configKeys": [] } }
```

- `layer` **(lint)**: `general` | `language` | `framework` | `library`. Precedence follows it: `_general`, then languages, then frameworks, then libraries; later rules override earlier ones where they conflict.
- `extends` **(lint: packs exist)**: selecting this pack selects those too, so rules aren't duplicated.
- `detect`: `deps` are package names from package.json / composer.json, or names found in pyproject, requirements, Pipfile, go.mod, Cargo.toml, Gemfile, pubspec.yaml, *.csproj, Gradle, pom.xml. `files` are globs matched at any depth (`prisma/schema.prisma`, `**/*.tf`). `configKeys` are top-level keys of a package.json. `contains` is a list of `{ "files": "<glob>", "pattern": "<regex>" }` that matches when a file matching the glob contains the pattern (`provider = "postgresql"` in `schema.prisma`). Any one match selects the pack. Packs reached only by `extends` need no `detect`.
- `prefix` **(lint)**: every rule id starts with `<prefix>-`.

## _sections.md

Vercel style: the pack's sections in impact order, one line each.

```
1. Auth and access (nest-auth-*) · CRITICAL
2. Validation (nest-validate-*) · HIGH
3. Structure (nest-module-*) · MEDIUM
```

## Rule file

```
---
id: nest-guard-global
title: Register the auth guard globally and mark public routes @Public()
impact: CRITICAL
impactDescription: "every new route is reachable without a session"
roles: [implementer, reviewer, security]
check: "rg -n 'APP_GUARD' src/"
tags: auth, nestjs
---
One paragraph: what the rule is and the concrete consequence of breaking it.

**Incorrect (each controller remembers its own guard; the next one forgets):**

```ts
@Controller('invoices')
export class InvoicesController { … }
```

**Correct:**

```ts
providers: [{ provide: APP_GUARD, useClass: SessionGuard }]
```

Reference: https://docs.nestjs.com/security/authentication
```

- `id`, `title`, `impact` (`CRITICAL` | `HIGH` | `MEDIUM` | `LOW`), `impactDescription`, `roles` **(lint)**. `impactDescription` names a consequence ("2–10× slower list renders"), never an adjective.
- `roles` **(lint)**: which role files may name it, from `implementer, reviewer, security, verifier`.
- `check` (optional): a command or grep that finds the Incorrect form. Only when it is reliable; it is what later turns the rule into an enforced check.
- Body **(lint)**: ≤150 words of prose outside code blocks (if it needs more, it is two rules), and both an `**Incorrect` and a `**Correct` block. The Incorrect block is the fixture a reviewer must flag, so make it a realistic diff, minimal, in the stack's language.
- One rule, one checkable claim. Every rule must be visible in a diff or a command result. No "consider", no "best practice" without the concrete form, no aspirational thresholds ("90% coverage").
- Security rules name a source and a sink.

## Role file

```
# <pack> · <role>
Applies when: <detection summary, one line>
Read order: id-one, id-two, id-three

## Iron laws
- <max 3: rules whose violation is always a blocker, as absolutes>. Thinking "<the usual excuse>"? That is the bug.

## Deviation rules            (implementer only)
## Blocker vs should-fix      (reviewer only)
## Commands                   (verifier and security: real commands for this ecosystem's common tools)

## Output additions
- <extra lines this role's report carries for this stack, e.g. "migration generated: yes/no">

## Obstacles to report
- <two or three quirks the lead would otherwise rediscover>
```

- **(lint)** ≤300 words of prose, excluding code blocks. Every id in `Read order` exists in this pack, a pack it extends, or `_general`, and lists this role in its `roles`.
- `Read order` is the selector: highest impact first, and only rules this role acts on. Nothing else loads.
- Deviation rules come from `_general` (fix bugs in your own files and say so; add missing critical behaviour such as an auth check, validation or an index in your own files and say so; never add a dependency or run an install the brief did not list, and report a package that fails to resolve instead of substituting one; anything outside your files is BLOCKED). A pack's implementer file adds only stack-specific ones.
- Iron laws: at most three per file, only for rules whose violation is always a blocker.

## gotchas.md

```
- [gotcha] ThrottlerGuard must be registered after the auth guard, or rate limits apply before the user is known · paths: **/app.module.ts
```

**(lint)** One per line, exactly `- [gotcha] <text> · paths: <glob>`. Imported as lessons with `source: pack` on `packs.mjs build`, once per text: a lesson the user deletes (`memory lesson delete <id>`) is never re-imported.

## Writing rules for packs

- **(lint)** No persona sentences ("you are a senior…"): they add nothing the model lacks.
- **(lint)** Actions, not tools: "Run `npm test`", never "use the Bash tool".
- Imperative voice, no narrative examples, no prose that restates the code.
- One language per pack; a pack about Prisma shows TypeScript, not three languages.
- Test a new rule against a diff that breaks it before adding it: if the reviewer would flag it anyway without the rule, the rule is not earning its words.
