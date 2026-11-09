# monorepo gotchas

- [gotcha] In a git worktree, a node_modules symlinked from the main checkout resolves workspace packages to the main checkout; run pnpm install --offline in the worktree instead · paths: **/pnpm-workspace.yaml
- [gotcha] A package whose exports point at dist/ must be built before dependents can typecheck; a fresh worktree shows "cannot find module" until `turbo run build --filter=<pkg>...` runs · paths: **/package.json
- [gotcha] Turbo replays cached logs on a cache hit, so a "passing" test task may not have run at all; full-mode verification uses --force · paths: **/turbo.json
- [gotcha] Env vars not listed in turbo.json env/globalEnv are filtered out in strict env mode (Turbo 2 default), so a build reads undefined in CI but works locally · paths: **/turbo.json
