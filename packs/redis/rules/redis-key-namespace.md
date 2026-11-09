---
id: redis-key-namespace
title: Prefix every key with app and purpose, built by one key helper
impact: MEDIUM
impactDescription: "two features or services overwrite each other's keys, and one feature's data can't be found or flushed alone"
roles: [implementer, reviewer]
tags: naming, redis
---
Keys follow `<app>:<purpose>:<id>` (`shop:cache:product:42`, `shop:ratelimit:login:<ip>`) and come from one key helper or the client's `keyPrefix` option, not string literals scattered across files. Tenant-scoped data puts the session's tenant id in the key, so one tenant's cached response is never served to another. Apps sharing an instance rely on the prefix; numbered databases (`SELECT`) don't exist in Redis Cluster.

**Incorrect:**

```ts
await redis.set(id, JSON.stringify(product), 'EX', 300)
await redis.set(`report-${reportId}`, html, 'EX', 300)
```

**Correct:**

```ts
export const keys = {
  product: (id: string) => `shop:cache:product:${id}`,
  report: (orgId: string, id: string) => `shop:cache:report:${orgId}:${id}`,
}
await redis.set(keys.product(id), JSON.stringify(product), 'EX', 300)
```
