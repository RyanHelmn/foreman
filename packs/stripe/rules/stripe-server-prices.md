---
id: stripe-server-prices
title: Use Price ids or server-side amounts, never an amount from the client
impact: CRITICAL
impactDescription: "a shopper edits the request and pays one cent"
roles: [implementer, reviewer, security]
check: "rg -n -e 'unit_amount:\\s*(req|body|input)' -e 'amount:\\s*(req|body|input)' --glob '!node_modules'"
tags: stripe, money
---
Source: an amount, currency, price or discount in the request body. Sink: `checkout.sessions.create`, `paymentIntents.create`, invoice items. Accept product or Price ids and quantities from the client, then look up the Price (or compute the amount) on the server.

**Incorrect:**

```ts
const { amount } = await req.json()
await stripe.paymentIntents.create({ amount, currency: 'gbp' })
```

**Correct:**

```ts
const { priceId, quantity } = schema.parse(await req.json())
await stripe.checkout.sessions.create({ mode: 'payment', line_items: [{ price: allowedPrice(priceId), quantity }], success_url, cancel_url })
```

Reference: https://docs.stripe.com/payments/accept-a-payment
