---
id: gen-idempotent-handlers
title: Make webhook, queue and retryable handlers idempotent
impact: HIGH
impactDescription: "a redelivered event charges, emails or ships twice"
roles: [implementer, reviewer]
tags: general
---
Providers and queues deliver at least once. Record the event or job id and skip it if already handled, or make the write itself conditional.

**Incorrect:**

```ts
async function onPaid(event) { await createShipment(event.orderId) }
```

**Correct:**

```ts
async function onPaid(event) {
  const first = await db.processedEvent.createIfAbsent({ id: event.id })
  if (first) await createShipment(event.orderId)
}
```
