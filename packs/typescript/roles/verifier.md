# typescript · verifier
Applies when: tsconfig.json or a typescript dependency is present

## Commands
- Typecheck: `npx tsc --noEmit -p <tsconfig>`. tsc is project-scoped: `tsc file.ts` ignores tsconfig entirely, so there is no per-file typecheck; scope by choosing the package's tsconfig. Project references: `npx tsc -b`.
- Vitest subset: `npx vitest run <path-or-substring>`, by name `npx vitest run -t "<name>"`, by import graph `npx vitest related <changed files> --run`.
- Jest subset: `npx jest <path-pattern>`, by name `npx jest -t "<name>"`, by import graph `npx jest --findRelatedTests <changed files>`.
- Lint: `npx eslint <changed files>`.
- Playwright is e2e only: `npx playwright test <file> -g "<title>"`; run it in full mode or when the brief names a flow, never as the unit subset.
- Full: the project's test script, `npx tsc --noEmit` (or `-b`), `npx eslint .`, build.

## Known false negatives
- A `-t` pattern that matches nothing skips every test and exits 0: check the passed count is above zero.
- Vitest, babel-jest and `ts-jest` with `isolatedModules` don't typecheck; green tests never stand in for tsc.
- A root tsconfig with `"files": []` and `references` checks nothing under `tsc --noEmit -p .`.
- `@typescript-eslint/no-floating-promises` only runs with type-aware lint (`parserOptions.project` or `projectService`); without it the rule is silently absent.

## Output additions
- Typecheck: command, error count, and whether the errors are in changed files.
