---
id: redis-ttl-cache
title: Write every cache-like key with its TTL in the same command
impact: HIGH
impactDescription: "keys accumulate until Redis hits maxmemory and starts evicting or rejecting writes"
roles: [implementer, reviewer]
tags: memory, redis
---
Caches, rate-limit counters, OTPs, locks and idempotency markers carry an expiry: `SET key value EX seconds` (plus `NX` for locks). A separate `EXPIRE` after `SET` leaves an immortal key if the process dies between them, and a later plain `SET` on the key drops its TTL unless it passes `EX` or `KEEPTTL`. A counter created by `INCR` gets its expiry in the same `MULTI` (`EXPIRE key ttl NX` on Redis 7+). Only durable data (queues, streams, explicit stores) lives without a TTL.

**Incorrect:**

```ts
await redis.set(`cache:user:${id}`, JSON.stringify(user))
await redis.expire(`cache:user:${id}`, 300)
```

**Correct:**

```ts
await redis.set(`cache:user:${id}`, JSON.stringify(user), 'EX', 300)
await redis.multi().incr(key).expire(key, 60, 'NX').exec()
```

Reference: https://redis.io/docs/latest/commands/set/
