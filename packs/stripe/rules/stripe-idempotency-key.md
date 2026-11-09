---
id: stripe-idempotency-key
title: Pass a stable idempotencyKey on create calls that a user or job can repeat
impact: HIGH
impactDescription: "a double-click or job retry creates two charges, refunds or subscriptions"
roles: [implementer, reviewer]
tags: stripe, money
---
The SDK reuses a key for its own network retries, but a second call from your code is a new request. Derive the key from the business operation (order id, refund request id), not a fresh random value per attempt.

**Incorrect:**

```ts
await stripe.refunds.create({ payment_intent: pi }, { idempotencyKey: crypto.randomUUID() })
```

**Correct:**

```ts
await stripe.refunds.create({ payment_intent: pi }, { idempotencyKey: `refund-${refundRequest.id}` })
```

Reference: https://docs.stripe.com/api/idempotent_requests
