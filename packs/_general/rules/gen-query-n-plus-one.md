---
id: gen-query-n-plus-one
title: Load related data in one query, not one per row
impact: HIGH
impactDescription: "page time grows with row count; 100 rows means 101 queries"
roles: [implementer, reviewer]
tags: general
---
A query inside a loop over query results is the N+1 pattern. Join, include, or batch by ids.

**Incorrect:**

```ts
for (const order of orders) order.customer = await db.customer.findUnique({ where: { id: order.customerId } })
```

**Correct:**

```ts
const orders = await db.order.findMany({ include: { customer: true } })
```
