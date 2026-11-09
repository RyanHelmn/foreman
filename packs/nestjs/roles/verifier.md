# nestjs · verifier
Applies when: `@nestjs/core` is a dependency or `nest-cli.json` exists

## Commands
- Targeted unit tests (Jest, the Nest default): `npx jest src/billing` (positional paths work in every Jest version; the flag is `--testPathPattern` before Jest 30 and `--testPathPatterns` from 30). Vitest projects: `npx vitest run src/billing`.
- Typecheck: `npx tsc --noEmit -p tsconfig.json`.
- E2E: `npm run test:e2e` (default `jest --config ./test/jest-e2e.json`). Each spec boots the whole module graph and usually a real database and Redis; run e2e in full mode only.
- Full: unit suite, `npm run test:e2e`, typecheck, lint, `npx nest build`.

## Known false negatives
- Unit tests with a mocked `PrismaService` pass when the `where` lacks the owner or tenant; ownership needs an e2e or integration test against a real database.
- E2E apps from `Test.createTestingModule(...).createNestApplication()` don't run `main.ts`: pipes, guards, filters, global prefix and versioning registered there are absent unless the test setup repeats them.
- `.overrideGuard(SessionGuard).useValue({ canActivate: () => true })` makes every auth assertion pass.

## Obstacles to report
- "Jest did not exit one second after the test run has completed": a missing `app.close()` in `afterAll` leaves Prisma, Redis or BullMQ handles open. Report it as test setup, not a failure.
