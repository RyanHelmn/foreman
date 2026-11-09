# monorepo · implementer
Applies when: pnpm-workspace.yaml, turbo.json, nx.json, lerna.json or a package.json `workspaces` key is present
Read order: mono-worktree-offline-install, mono-no-deep-import, mono-exports-map, mono-workspace-dep-declared, mono-turbo-inputs-outputs, mono-shared-config

## Iron laws
- Never link or copy `node_modules` from another checkout into your worktree. Thinking "install is slow, the deps are identical"? That is the bug: the workspace links point at the other checkout.

## Deviation rules
- Run tests and typecheck through the workspace filter for the package you changed (`pnpm --filter <pkg> test`, `npx turbo run test --filter=<pkg>`), not from the repo root.
- A shared package's public surface (`exports`, entry file) changed: say so, and name the consuming packages you know of.

## Output additions
- Packages touched: names, and whether any `exports` entry or workspace dependency changed.

## Obstacles to report
- `pnpm install --offline` fails in the worktree (package missing from the store): BLOCKED with the package name.
- Dependents fail with "cannot find module" because the dependency's `dist/` isn't built.
