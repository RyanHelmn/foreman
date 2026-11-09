---
id: prisma-transaction-multi-write
title: Wrap dependent writes in $transaction and use the tx client for every query inside it
impact: HIGH
impactDescription: "a failure between writes leaves stock decremented for an order that never saved"
roles: [implementer, reviewer]
tags: transactions, prisma
---
Writes that must succeed together go in `prisma.$transaction([...])` when they are independent, or `prisma.$transaction(async (tx) => …)` when later writes depend on earlier reads. Inside the callback every query uses `tx`: a call on `this.prisma` runs on another connection outside the transaction and is not rolled back with it. A single nested write (`create` with nested `create` or `connect`) is already atomic and needs no wrapper.

**Incorrect:**

```ts
await this.prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ data })
  await this.prisma.stock.update({ where: { sku }, data: { qty: { decrement: 1 } } })
})
```

**Correct:**

```ts
await this.prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ data })
  await tx.stock.update({ where: { sku }, data: { qty: { decrement: 1 } } })
})
```

Reference: https://www.prisma.io/docs/orm/prisma-client/queries/transactions
