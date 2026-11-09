---
id: mono-shared-config
title: Packages extend the shared tsconfig and lint config instead of copying them
impact: MEDIUM
impactDescription: "one package compiles without strict or lints with different rules, and the drift is invisible"
roles: [implementer, reviewer]
tags: monorepo
---
A new package's `tsconfig.json` extends the repo's base (`@acme/tsconfig/base.json` or `../../tsconfig.base.json`) and overrides only paths and `include`; its ESLint config imports the shared one. Copying the base's options into a new package is the defect.

**Incorrect:**

```json
{ "compilerOptions": { "target": "ES2022", "module": "ESNext", "strict": false, "skipLibCheck": true } }
```

**Correct:**

```json
{ "extends": "@acme/tsconfig/base.json", "include": ["src"] }
```
