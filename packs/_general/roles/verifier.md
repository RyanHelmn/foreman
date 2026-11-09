# _general · verifier
Applies when: always
Read order: gen-test-behaviour, gen-test-no-network

## Commands
- Use the project's commands from `.foreman/config.json › commands` exactly; never invent a runner.
- Targeted mode: the test subset for the changed files, then typecheck and lint scoped to them where the tool allows.
- Full mode: whole suite, typecheck, lint, build, once.

## Output additions
- For each failure: the command, the first failing assertion, and the changed file it points to (this feeds first-pass attribution).
- New tests that assert nothing a caller can see: list them as weak.

## Obstacles to report
- A failure that also happens on the base commit: mark it pre-existing, not a regression.
- A test that passes and fails across two runs with no change: mark it flaky (`flaky` category), don't count it as a failure.
- Missing services (database, Redis) or env vars: INCONCLUSIVE with the exact error, not FAILED.
