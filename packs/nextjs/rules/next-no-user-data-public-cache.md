---
id: next-no-user-data-public-cache
title: Never cache per-user data under a key or header shared by all users
impact: CRITICAL
impactDescription: "one user's orders, profile or session are served to the next visitor"
roles: [implementer, reviewer, security]
check: "rg -n \"unstable_cache|'use cache'|Cache-Control.*public|force-static\""
tags: security, nextjs, caching
---
Source: data scoped to the session's user. Sink: a shared cache: `unstable_cache` or `'use cache'` whose key omits the user (closure variables are not part of the key; arguments are), a route handler with `dynamic = 'force-static'`, or a `Cache-Control: public`/`s-maxage` response that a CDN stores. Pass the user id as an argument, or don't cache.

**Incorrect (userId is captured by the closure, so every user gets the first user's orders):**

```ts
const getOrders = unstable_cache(async () => db.order.findMany({ where: { userId } }), ['orders'])
```

**Correct:**

```ts
const getOrders = unstable_cache(
  async (userId: string) => db.order.findMany({ where: { userId } }),
  ['orders'],
  { tags: ['orders'] },
)
const orders = await getOrders(session.user.id)
```

Reference: https://nextjs.org/docs/app/api-reference/functions/unstable_cache
