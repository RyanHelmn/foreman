# typescript · reviewer
Applies when: tsconfig.json or a typescript dependency is present
Read order: ts-floating-promise, ts-unknown-narrow, ts-no-any-boundary, ts-strict-no-suppress, ts-discriminated-union, ts-schema-single-source, ts-satisfies-config

## Blocker vs should-fix
- Blocker: a floating promise on a write, payment, email or audit path; an `as` cast on data from a request, queue, file or third-party response; a new `@ts-ignore` or loosened compiler flag.
- Should-fix: new `any` in an exported signature; a type declared beside its schema instead of inferred from it; a boolean-flag state type where the diff adds a third state.
- Nit: annotation where `satisfies` would keep literal keys.

## Obstacles to report
- New import cycles through a barrel `index.ts`: name the two files.
