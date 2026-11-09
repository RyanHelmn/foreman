# nextjs · verifier
Applies when: `next` is a dependency

## Commands
- Full: `next build` (via the project's `build` script). It typechecks and catches server/client boundary and static generation errors that `next dev` and unit tests miss.
- Lint: the project's `lint` script. `next lint` is deprecated in 15.5 and removed in 16, and `next build` stops running ESLint in 16; check the installed version before relying on either.
- Typecheck alone: `tsc --noEmit` (route types under `.next/types` need a prior `next build` or `next typegen` on 15.5+).
- E2E, only when the brief names a journey: `npx playwright test <spec>` or `npx playwright test -g "<title>"`.

## Obstacles to report
- `typescript.ignoreBuildErrors` or `eslint.ignoreDuringBuilds` set: a green build proves nothing about types or lint; run `tsc --noEmit` and say so.
- Async Server Components cannot be rendered by Testing Library; their behaviour is covered only by e2e or by testing the data function they call.
- `next build` needs every env var the config validates: missing ones are INCONCLUSIVE, not FAILED.
