---
id: bull-idempotent-processor
title: Make processors safe to run twice and dedupe producers with a deterministic jobId
impact: HIGH
impactDescription: "a retried or stalled job sends the email or charges the card a second time"
roles: [implementer, reviewer]
tags: queues, bullmq
---
BullMQ runs a job again after a failure with attempts left, and when its lock expires because the worker stalled or its event loop blocked, so the side effect may already have happened. Producers adding a job for a business event pass a deterministic `jobId` (`receipt-${orderId}`); BullMQ ignores the add while a job with that id still exists. Processors check a business marker before the side effect, pass an idempotency key to providers that accept one, and record completion afterwards.

**Incorrect:**

```ts
await this.queue.add('send-receipt', { orderId })

async process(job: Job<{ orderId: string }>) {
  await this.mailer.sendReceipt(job.data.orderId)
}
```

**Correct:**

```ts
await this.queue.add('send-receipt', { orderId }, { jobId: `receipt-${orderId}` })

async process(job: Job<{ orderId: string }>) {
  const order = await this.prisma.order.findUniqueOrThrow({ where: { id: job.data.orderId } })
  if (order.receiptSentAt) return
  await this.mailer.sendReceipt(order, { idempotencyKey: `receipt-${order.id}` })
  await this.prisma.order.update({ where: { id: order.id }, data: { receiptSentAt: new Date() } })
}
```

Reference: https://docs.bullmq.io/guide/jobs/job-ids
