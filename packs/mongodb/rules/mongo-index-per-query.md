---
id: mongo-index-per-query
title: Add an index for every new filter and sort shape
impact: HIGH
impactDescription: "each request scans the whole collection; latency grows with every document"
roles: [implementer, reviewer]
tags: mongodb, performance
---
A new `find` filter or sort needs a compound index whose fields follow equality, then sort, then range. Declare it where the project declares indexes (Mongoose `schema.index`, or a migration calling `createIndex`). `explain('executionStats')` showing `COLLSCAN` is the failure.

**Incorrect:**

```ts
Order.find({ orgId, status: 'open' }).sort({ createdAt: -1 })
```

**Correct:**

```ts
orderSchema.index({ orgId: 1, status: 1, createdAt: -1 })
```

Reference: https://www.mongodb.com/docs/manual/tutorial/equality-sort-range-guideline/
