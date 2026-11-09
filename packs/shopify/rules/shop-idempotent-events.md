---
id: shop-idempotent-events
title: Dedupe webhooks on X-Shopify-Webhook-Id and acknowledge before slow work
impact: HIGH
impactDescription: "a retried delivery fulfils, emails or syncs the same order twice"
roles: [implementer, reviewer]
tags: shopify, webhooks
---
Shopify retries a delivery that is not answered with a 2xx within a few seconds, and the retry carries the same `X-Shopify-Webhook-Id`. Record that id with a unique constraint and skip repeats; enqueue the slow work and return 200, so a slow handler does not trigger the retry that duplicates it.

**Incorrect:**

```ts
const { topic, payload } = await authenticate.webhook(request)
await syncOrderToErp(payload)
return new Response()
```

**Correct:**

```ts
const { topic, payload } = await authenticate.webhook(request)
const id = request.headers.get('x-shopify-webhook-id')!
if (await markProcessed(id)) await queue.add(topic, payload)
return new Response()
```

Reference: https://shopify.dev/docs/apps/build/webhooks/ignore-duplicates
