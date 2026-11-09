# typescript · implementer
Applies when: tsconfig.json or a typescript dependency is present
Read order: ts-floating-promise, ts-unknown-narrow, ts-no-any-boundary, ts-strict-no-suppress, ts-discriminated-union, ts-schema-single-source, ts-satisfies-config

## Iron laws
- No `@ts-ignore`, `as any` or tsconfig loosening to get a diff to compile. Thinking "the types are wrong, the code is fine"? That is the bug, or a `@ts-expect-error` with the reason.

## Deviation rules
- Never edit tsconfig, eslint config or a shared type package you do not own to make your code pass; report BLOCKED.
- Run `npx tsc --noEmit -p <your package's tsconfig>` before reporting DONE.

## Output additions
- Typecheck: the command run and its result.
- Suppressions added (`@ts-expect-error`, `!`, `as`): each with its reason, or "none".

## Obstacles to report
- tsc errors that already exist on the base commit: name the count, don't fix them.
- An import that only resolves through a tsconfig `paths` alias in code that runs under plain `node`.
