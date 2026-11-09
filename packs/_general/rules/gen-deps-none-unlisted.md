---
id: gen-deps-none-unlisted
title: Add no dependency the brief did not list; never substitute a package that fails to resolve
impact: HIGH
impactDescription: "supply-chain risk from a typosquatted or hallucinated package"
roles: [implementer, reviewer, security]
tags: general
---
Prefer the standard library and packages the project already uses. A package that fails to install is reported as BLOCKED, never swapped for a similarly named one. Lockfile changes must match the manifest change.

**Incorrect (brief listed none; install failed, so a lookalike was tried):**

```diff
+ "dependencies": { "react-hook-form-zod": "^1.0.0" }
```

**Correct:**

```text
BLOCKED: @hookform/resolvers is not installed and the brief lists no new dependencies.
```
