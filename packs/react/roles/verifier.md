# react · verifier
Applies when: `react` is a dependency
Read order: react-test-by-role

## Commands
- Subset, Vitest: `npx vitest run <path>` or `npx vitest run -t "<test name>"`; `npx vitest related <changed files> --run` for tests importing them.
- Subset, Jest: `npx jest <path>`, `npx jest -t "<test name>"`, `npx jest --findRelatedTests <changed files>`.
- Full: the project's `test` script, plus `tsc --noEmit` when no build step typechecks.

## Output additions
- New component tests that query by class, `querySelector` or test id where a role exists, or that only snapshot: list as weak.

## Obstacles to report
- jsdom has no layout or CSS: visibility via CSS classes, scrolling and sizes pass in tests regardless; say so when the change depends on them.
- Snapshot files updated in the diff (`-u`): a regression can hide there; list the changed snapshots.
