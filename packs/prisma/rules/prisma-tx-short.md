---
id: prisma-tx-short
title: Keep interactive transactions to database work, and pass { timeout } for bulk work
impact: HIGH
impactDescription: "the transaction holds a pooled connection and row locks through a network call and is rolled back at the 5 s default timeout"
roles: [implementer, reviewer]
tags: transactions, prisma
---
Interactive transactions default to `maxWait: 2000` and `timeout: 5000` ms. An HTTP call, email or queue add inside the callback holds a connection and locks for its duration, and is not undone when the transaction rolls back. Make external calls before the transaction or after it commits (write an outbox row inside it if the call must happen). For bulk work in one transaction, use `createMany` rather than a per-row loop and pass `{ timeout }` sized to the batch.

**Incorrect:**

```ts
await prisma.$transaction(async (tx) => {
  const inv = await tx.invoice.create({ data })
  await stripe.invoices.create({ customer: inv.customerId })
  for (const line of lines) await tx.line.create({ data: { ...line, invoiceId: inv.id } })
})
```

**Correct:**

```ts
const inv = await prisma.$transaction(async (tx) => {
  const inv = await tx.invoice.create({ data })
  await tx.line.createMany({ data: lines.map((l) => ({ ...l, invoiceId: inv.id })) })
  return inv
}, { timeout: 15_000 })
await stripe.invoices.create({ customer: inv.customerId })
```

Reference: https://www.prisma.io/docs/orm/prisma-client/queries/transactions#interactive-transactions
