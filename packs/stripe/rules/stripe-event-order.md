---
id: stripe-event-order
title: Re-read the object from Stripe instead of trusting event order
impact: HIGH
impactDescription: "a late customer.subscription.updated overwrites a newer cancellation and keeps access open"
roles: [implementer, reviewer]
tags: stripe, webhooks
---
Stripe does not deliver events in order, and retries arrive late. Handlers that copy `event.data.object` into the database let an older snapshot overwrite a newer one. Retrieve the current object (or compare its timestamp with the stored one) before writing state. Dedupe on `event.id` as well (gen-idempotent-handlers).

**Incorrect:**

```ts
case 'customer.subscription.updated':
  await db.sub.update({ where: { id: sub.id }, data: { status: sub.status } })
```

**Correct:**

```ts
case 'customer.subscription.updated': {
  const current = await stripe.subscriptions.retrieve(event.data.object.id)
  await db.sub.update({ where: { id: current.id }, data: { status: current.status } })
}
```

Reference: https://docs.stripe.com/webhooks#event-ordering
