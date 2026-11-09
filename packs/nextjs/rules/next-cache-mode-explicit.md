---
id: next-cache-mode-explicit
title: State the cache mode of every server fetch
impact: MEDIUM
impactDescription: "data is stale for everyone, or caching silently flips on a Next.js upgrade"
roles: [implementer, reviewer]
tags: nextjs, caching
---
The default changed across versions: `fetch` was cached by default in Next.js 14 and is not in 15. Write the intent: `cache: 'no-store'` for per-request data, `next: { revalidate: n, tags: [...] }` for shared data, or `'use cache'` with `cacheLife`/`cacheTag` when the project enables `cacheComponents`. Match the mechanism the project already uses; don't mix route-segment `revalidate` exports and `'use cache'` in one tree.

**Incorrect:**

```ts
const res = await fetch(`${API}/pricing`)
```

**Correct:**

```ts
const res = await fetch(`${API}/pricing`, { next: { revalidate: 3600, tags: ['pricing'] } })
```

Reference: https://nextjs.org/docs/app/guides/caching
