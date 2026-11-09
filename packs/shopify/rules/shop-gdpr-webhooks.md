---
id: shop-gdpr-webhooks
title: Subscribe to and act on the three mandatory compliance webhooks
impact: HIGH
impactDescription: "the app fails App Store review and keeps customer data after a redact request"
roles: [implementer, reviewer]
check: "rg -n 'compliance_topics' shopify.app*.toml"
tags: shopify, privacy
---
Public apps must handle `customers/data_request`, `customers/redact` and `shop/redact`. Declare them under `compliance_topics` in `shopify.app.toml` and make the handlers do the work: return or delete that customer's rows, and delete everything for the shop (sessions included) on `shop/redact`. A handler that only returns 200 passes the subscription check and fails the obligation.

**Incorrect:**

```ts
case 'CUSTOMERS_REDACT':
  return new Response()
```

**Correct:**

```toml
[[webhooks.subscriptions]]
compliance_topics = ["customers/data_request", "customers/redact", "shop/redact"]
uri = "/webhooks/compliance"
```

```ts
case 'CUSTOMERS_REDACT':
  await db.wishlist.deleteMany({ where: { shop, customerId: String(payload.customer.id) } })
  return new Response()
```

Reference: https://shopify.dev/docs/apps/build/compliance/privacy-law-compliance
