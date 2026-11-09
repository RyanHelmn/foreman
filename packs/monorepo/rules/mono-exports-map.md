---
id: mono-exports-map
title: Every workspace package declares its public entry points in package.json exports
impact: HIGH
impactDescription: "consumers bind to internal file paths, so a refactor inside one package breaks apps it never mentions"
roles: [implementer, reviewer]
tags: monorepo
---
A shared package lists what others may import in `exports`; anything not listed is private and Node/TypeScript (`moduleResolution: bundler`/`nodenext`) refuse it. When a diff adds something other packages need, add it to the package's entry file or a new `exports` subpath, not a path into its folders.

**Incorrect:**

```json
{ "name": "@acme/ui", "main": "src/index.ts" }
```

**Correct:**

```json
{
  "name": "@acme/ui",
  "exports": {
    ".": "./src/index.ts",
    "./button": "./src/button.tsx"
  }
}
```
