---
id: redis-stream-consumer-ack
title: In stream consumer groups, XACK after the work commits and reclaim stuck entries
impact: MEDIUM
impactDescription: "messages acked before processing are lost on a crash, and a dead consumer's messages stay pending forever"
roles: [implementer, reviewer]
tags: streams, redis
---
Read with `XREADGROUP`, handle each entry idempotently (keyed on the entry id or a business id, since it can be delivered again), then `XACK`. Acking first loses the message if the consumer dies mid-way. Entries held by a dead consumer stay in the pending list until another consumer claims them with `XAUTOCLAIM` (Redis 6.2+) after an idle threshold; without a claim step they are never processed. Cap the stream with `XADD … MAXLEN ~ n` or `XTRIM`.

**Incorrect:**

```ts
for (const [id, fields] of entries) {
  await redis.xack('events', 'billing', id)
  await handle(fields)
}
```

**Correct:**

```ts
const [, claimed] = await redis.xautoclaim('events', 'billing', consumer, 60_000, '0-0', 'COUNT', 50)
for (const [id, fields] of [...claimed, ...entries]) {
  await handle(id, fields)
  await redis.xack('events', 'billing', id)
}
```

Reference: https://redis.io/docs/latest/develop/data-types/streams/#consumer-groups
