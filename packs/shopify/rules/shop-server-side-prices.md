---
id: shop-server-side-prices
title: Take prices and discounts from Shopify on the server, never from the storefront request
impact: CRITICAL
impactDescription: "a shopper edits the request and checks out at any price they choose"
roles: [implementer, reviewer, security]
tags: shopify, money
---
Source: a price, discount or total in a request from the theme, app proxy or app block. Sink: a draft order, custom line item, discount or charge. Send only variant ids and quantities from the client; look up the price through the Admin API on the server.

**Incorrect:**

```ts
const { variantId, price } = await request.json()
await admin.graphql(DRAFT_ORDER_CREATE, { variables: { input: { lineItems: [{ title: 'Custom', originalUnitPrice: price, quantity: 1 }] } } })
```

**Correct:**

```ts
const { variantId, quantity } = await request.json()
await admin.graphql(DRAFT_ORDER_CREATE, { variables: { input: { lineItems: [{ variantId, quantity }] } } })
```

Reference: https://shopify.dev/docs/api/admin-graphql/latest/mutations/draftOrderCreate
