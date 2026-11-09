---
id: gen-webhook-signature
title: Verify webhook signatures on the raw body before parsing
impact: CRITICAL
impactDescription: "anyone can forge payment, order or account events"
roles: [implementer, reviewer, security]
tags: general
---
Source: an inbound webhook. Sink: any state change it triggers. Verify the provider's signature over the raw bytes with a constant-time compare, and reject old timestamps. Parsing first and re-serialising breaks the signature.

**Incorrect:**

```ts
app.post('/webhooks/pay', express.json(), (req, res) => markPaid(req.body.orderId))
```

**Correct:**

```ts
app.post('/webhooks/pay', express.raw({ type: 'application/json' }), (req, res) => {
  const event = provider.verify(req.body, req.header('signature'), secret)
  markPaid(event.orderId)
})
```
