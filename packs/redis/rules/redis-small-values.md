---
id: redis-small-values
title: Never store an unbounded collection under one key
impact: MEDIUM
impactDescription: "reading, writing or deleting a multi-megabyte key blocks Redis's single thread and every other request waits"
roles: [implementer, reviewer]
tags: latency, redis
---
Don't cache a whole result set (all of a tenant's orders, a full history) as one string or hash; cache per item or per page. Lists, sets and sorted sets that grow with traffic are capped when appended to (`LTRIM`, `ZREMRANGEBYRANK`) or get a TTL. Delete large keys with `UNLINK`, which frees memory in the background, not `DEL`.

**Incorrect:**

```ts
await redis.set(`cache:orders:${orgId}`, JSON.stringify(await this.orders.all(orgId)), 'EX', 600)
await redis.lpush(`events:${orgId}`, JSON.stringify(event))
```

**Correct:**

```ts
await redis.set(`cache:orders:${orgId}:page:${page}`, JSON.stringify(rows), 'EX', 600)
await redis.multi().lpush(`events:${orgId}`, JSON.stringify(event)).ltrim(`events:${orgId}`, 0, 999).exec()
```
