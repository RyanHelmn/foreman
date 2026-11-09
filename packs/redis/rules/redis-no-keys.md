---
id: redis-no-keys
title: Iterate keys with SCAN, never KEYS, in application code
impact: HIGH
impactDescription: "KEYS walks the whole keyspace in one blocking call and stalls Redis for every client"
roles: [implementer, reviewer]
tags: latency, redis
---
`KEYS pattern` is O(N) over all keys and Redis runs one command at a time. Use `SCAN` with `MATCH` and `COUNT` (ioredis `scanStream`), and delete matches in batches with `UNLINK`. Better still, avoid scanning for invalidation: keep a set of the keys a group owns, or version the namespace (`cache:v2:`) and let the old keys expire.

**Incorrect:**

```ts
const keys = await redis.keys(`cache:org:${orgId}:*`)
if (keys.length) await redis.del(...keys)
```

**Correct:**

```ts
const stream = redis.scanStream({ match: `cache:org:${orgId}:*`, count: 500 })
for await (const keys of stream) if (keys.length) await redis.unlink(...keys)
```

Reference: https://redis.io/docs/latest/commands/keys/
