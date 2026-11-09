---
id: stripe-fulfil-on-webhook
title: Fulfil from the webhook, never from the success_url redirect
impact: CRITICAL
impactDescription: "anyone who opens the success URL gets the order, and payers who close the tab get nothing"
roles: [implementer, reviewer, security]
tags: stripe, money
---
Source: a browser landing on `success_url?session_id=…`. Sink: order fulfilment, credits, plan upgrades. The redirect proves nothing about payment and is skipped when the tab closes. Fulfil on `checkout.session.completed` (and `async_payment_succeeded` for delayed methods) after checking `payment_status === 'paid'`; the success page only shows status.

**Incorrect:**

```ts
export default async function Success({ searchParams }) {
  await grantCredits(searchParams.session_id)
  return <Thanks />
}
```

**Correct:**

```ts
if (event.type === 'checkout.session.completed' && event.data.object.payment_status === 'paid') {
  await grantCredits(event.data.object.id)
}
```

Reference: https://docs.stripe.com/checkout/fulfillment
