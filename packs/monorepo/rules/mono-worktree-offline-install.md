---
id: mono-worktree-offline-install
title: In a git worktree, install dependencies in the worktree; never symlink node_modules from the main checkout
impact: HIGH
impactDescription: "workspace packages resolve to the main checkout's source, so tests pass or fail against code the diff never touched"
roles: [implementer, verifier]
check: "realpath node_modules/@*/* 2>/dev/null | rg -v \"^$PWD\""
tags: monorepo, worktree
---
Workspace packages in `node_modules` are symlinks to their folders. A `node_modules` symlinked or copied from the main checkout points those links at the main checkout, so edits to a sibling package in the worktree are invisible. Run `pnpm install --offline` (or `--prefer-offline`) in the worktree; the shared store makes it fast. If it fails offline, report BLOCKED rather than linking.

**Incorrect:**

```sh
ln -s ../main/node_modules node_modules
pnpm --filter @acme/api test
```

**Correct:**

```sh
pnpm install --offline
pnpm --filter @acme/api test
```
