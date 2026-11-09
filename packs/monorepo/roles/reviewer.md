# monorepo · reviewer
Applies when: pnpm-workspace.yaml, turbo.json, nx.json, lerna.json or a package.json `workspaces` key is present
Read order: mono-no-deep-import, mono-workspace-dep-declared, mono-exports-map, mono-turbo-inputs-outputs, mono-shared-config

## Blocker vs should-fix
- Blocker: an import into another package's `src/` or `dist/`; an import of a workspace package missing from the consumer's package.json; a new build task or env var with no `outputs`/`env` entry.
- Should-fix: a new package not extending the shared tsconfig/eslint config; new shared code exported by deep path instead of an `exports` entry.

## Obstacles to report
- An import cycle between two workspace packages: name both.
