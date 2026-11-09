---
id: mongo-transaction-multi-doc
title: Wrap multi-document writes in withTransaction and pass the session to every operation
impact: HIGH
impactDescription: "a failure halfway leaves stock decremented with no order, or money moved one side only"
roles: [implementer, reviewer]
check: "rg -n -A12 'withTransaction' --glob '!node_modules'"
tags: mongodb, consistency
---
Writes that must succeed or fail together run inside `session.withTransaction()`, and each operation inside it receives `{ session }`. An operation without the session runs outside the transaction and is not rolled back. Single-document updates are already atomic and need no transaction.

**Incorrect:**

```ts
await session.withTransaction(async () => {
  await Stock.updateOne({ sku }, { $inc: { qty: -1 } }, { session })
  await Order.create([{ sku, userId }])
})
```

**Correct:**

```ts
await session.withTransaction(async () => {
  await Stock.updateOne({ sku, qty: { $gt: 0 } }, { $inc: { qty: -1 } }, { session })
  await Order.create([{ sku, userId }], { session })
})
```

Reference: https://www.mongodb.com/docs/manual/core/transactions/
