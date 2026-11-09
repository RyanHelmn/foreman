---
id: shop-webhook-hmac-raw-body
title: Verify X-Shopify-Hmac-Sha256 over the raw body before parsing
impact: CRITICAL
impactDescription: "anyone can post a fake orders/paid or app/uninstalled event and change shop state"
roles: [implementer, reviewer, security]
check: "rg -n -B2 -A6 'webhooks' --glob '!node_modules' | rg 'express.json|request.json\\(\\)'"
tags: shopify, webhooks
---
Source: a POST to the webhook route. Sink: whatever the topic handler writes. The header is a base64 HMAC-SHA256 of the raw body keyed with the app's client secret. In the Remix or React Router template, `authenticate.webhook(request)` verifies it; read the payload it returns, never `request.json()` first. In Express, mount `express.raw` on the webhook route before any global `express.json()`.

**Incorrect:**

```ts
app.use(express.json())
app.post('/webhooks', (req, res) => handle(req.header('x-shopify-topic'), req.body))
```

**Correct:**

```ts
app.post('/webhooks', express.raw({ type: 'application/json' }), (req, res) => {
  const digest = crypto.createHmac('sha256', env.SHOPIFY_API_SECRET).update(req.body).digest()
  const given = Buffer.from(req.header('x-shopify-hmac-sha256') ?? '', 'base64')
  if (given.length !== digest.length || !crypto.timingSafeEqual(digest, given)) return res.sendStatus(401)
  handle(req.header('x-shopify-topic'), JSON.parse(req.body.toString()))
  res.sendStatus(200)
})
```

Reference: https://shopify.dev/docs/apps/build/webhooks/subscribe/https
