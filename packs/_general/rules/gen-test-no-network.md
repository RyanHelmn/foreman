---
id: gen-test-no-network
title: Tests never reach the real network; replace clients at their boundary
impact: MEDIUM
impactDescription: "the suite is flaky, slow, and can hit live services with real data"
roles: [implementer, reviewer, verifier]
tags: general
---
Unit and integration tests replace third-party HTTP, email, payment and AI clients at the module that wraps them, or with a request interceptor. Local services the project runs for tests (database, Redis) are fine.

**Incorrect:**

```ts
it('charges the card', async () => {
  await checkout(cart)
})
```

**Correct:**

```ts
it('charges the card', async () => {
  const payments = fakePayments()
  await checkout(cart, { payments })
  expect(payments.charges).toHaveLength(1)
})
```
