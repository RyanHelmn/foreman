# monorepo · verifier
Applies when: pnpm-workspace.yaml, turbo.json, nx.json, lerna.json or a package.json `workspaces` key is present
Read order: mono-worktree-offline-install, mono-workspace-dep-declared, mono-turbo-inputs-outputs

## Commands
- Before anything: in a worktree, check workspace links resolve inside it (`realpath node_modules/@<scope>/<pkg>`); if not, run `pnpm install --offline` or report INCONCLUSIVE.
- pnpm: `pnpm --filter <pkg> test`; changed packages and their dependents `pnpm --filter "...[origin/main]" test`; a package and its dependencies `pnpm --filter "<pkg>..." build`.
- Turborepo: `npx turbo run test --filter=<pkg>`; changed and dependents `npx turbo run test --filter=...[origin/main]`; full mode adds `--force` to bypass the cache.
- Nx: `npx nx run <project>:test`; `npx nx affected -t test lint typecheck --base=origin/main`; full mode adds `--skip-nx-cache`.
- npm / Yarn workspaces: `npm test -w <pkg>`, `yarn workspace <pkg> test`.

## Known false negatives
- A cache hit ("cache hit, replaying logs" / "existing outputs match the cache") means the task did not run against the diff's inputs if `inputs`/`env` are incomplete; in full mode, bypass the cache.
- Testing only the changed package misses breakage in its dependents; targeted mode includes `...` dependents when a shared package changed.
- A filter that matches no package exits 0 with nothing run: check the task count.
