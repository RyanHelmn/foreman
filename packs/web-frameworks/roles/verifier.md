# web-frameworks · verifier
Applies when: Remix, React Router framework mode, SvelteKit, Nuxt or Astro is detected

## Commands
- Typecheck, by framework (prefer the project's `check`/`typecheck` script): SvelteKit `svelte-kit sync && svelte-check --tsconfig ./tsconfig.json`; React Router v7 `react-router typegen && tsc`; Nuxt `nuxi typecheck`; Astro `astro check`; Remix `tsc`.
- Full: the project's `build` script, which catches client imports of server-only modules.
- Unit subset: `npx vitest run <path>` or `npx vitest run -t "<name>"`.
- E2E, only for a named journey: `npx playwright test <spec>`.

## Obstacles to report
- `tsc` without typegen/sync checks stale route types and can pass or fail falsely.
- `astro check` needs `@astrojs/check`, and `nuxi typecheck` needs `vue-tsc`; if absent, report INCONCLUSIVE rather than installing them.
