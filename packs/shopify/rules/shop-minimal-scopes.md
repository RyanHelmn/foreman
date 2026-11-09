---
id: shop-minimal-scopes
title: Request only the access scopes the code calls
impact: MEDIUM
impactDescription: "a leaked token can write products, orders or customers the app never touches, and review rejects the app"
roles: [implementer, reviewer, security]
check: "rg -n -A3 'access_scopes' shopify.app*.toml"
tags: shopify, scopes
---
Each scope in `shopify.app.toml` `[access_scopes]` must map to a query or mutation in the code. Use `read_` where the app only reads. Adding a scope forces every merchant through re-consent, so a scope change belongs in the plan, not slipped into a unit.

**Incorrect:**

```toml
[access_scopes]
scopes = "read_products,write_products,read_orders,write_orders,read_customers,write_customers"
```

**Correct:**

```toml
[access_scopes]
scopes = "read_products,read_orders"
```

Reference: https://shopify.dev/docs/api/usage/access-scopes
