---
id: mono-workspace-dep-declared
title: A package that imports another workspace package lists it in its own package.json
impact: HIGH
impactDescription: "the import resolves only through hoisting; the task graph builds packages in the wrong order and the deploy of that app fails"
roles: [implementer, reviewer, verifier]
tags: monorepo
---
Hoisted `node_modules` lets an undeclared import resolve locally. The task runner then doesn't know the edge, so `^build` doesn't build the dependency first and isolated deploys (`turbo prune`, Docker per app) miss it. Add `"@acme/db": "workspace:*"` (pnpm/Yarn/Bun; npm uses the version) to the consumer. Adding a workspace dependency is a manifest change: it needs to be in the brief like any other dependency.

**Incorrect (apps/api/src/billing.ts imports @acme/db; apps/api/package.json):**

```json
{ "dependencies": { "fastify": "^5.0.0" } }
```

**Correct:**

```json
{ "dependencies": { "@acme/db": "workspace:*", "fastify": "^5.0.0" } }
```
