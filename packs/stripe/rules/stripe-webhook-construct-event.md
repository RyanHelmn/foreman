---
id: stripe-webhook-construct-event
title: Build webhook events with stripe.webhooks.constructEvent on the raw body
impact: CRITICAL
impactDescription: "anyone can post a fake checkout.session.completed and get goods or credit for free"
roles: [implementer, reviewer, security]
check: "rg -n -e 'constructEvent' -e 'tolerance' --glob '!node_modules'"
tags: stripe, webhooks
---
Source: a POST to the Stripe webhook route. Sink: fulfilment, credit, subscription state. Pass the unparsed body (`await req.text()` in a Next.js route handler, `express.raw` in Express), the `stripe-signature` header and that endpoint's `whsec_` secret. Keep the default timestamp tolerance (300 seconds); it is the replay window.

**Incorrect:**

```ts
export async function POST(req: Request) {
  const event = await req.json()
  if (event.type === 'checkout.session.completed') await fulfil(event.data.object)
}
```

**Correct:**

```ts
export async function POST(req: Request) {
  const event = stripe.webhooks.constructEvent(await req.text(), req.headers.get('stripe-signature')!, env.STRIPE_WEBHOOK_SECRET)
  if (event.type === 'checkout.session.completed') await fulfil(event.data.object)
  return new Response()
}
```

Reference: https://docs.stripe.com/webhooks#verify-events
