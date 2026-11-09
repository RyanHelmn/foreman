---
id: bull-attempts-backoff
title: Set bounded attempts with backoff, and fail permanent errors with UnrecoverableError
impact: HIGH
impactDescription: "a transient 503 fails the job for good, or a permanent 400 hammers the provider on every retry"
roles: [implementer, reviewer]
tags: queues, bullmq
---
A job added without `attempts` runs once. Set `attempts` and an exponential `backoff` in the queue's `defaultJobOptions` or on each `add`. Throw `UnrecoverableError` for failures that retrying can't fix (invalid data, a 4xx other than 429, a deleted record) so the job fails at once instead of burning its attempts.

**Incorrect:**

```ts
BullModule.registerQueue({ name: 'webhooks' })

async process(job: Job<WebhookJob>) {
  const res = await post(job.data)
  if (!res.ok) throw new Error(res.statusText)
}
```

**Correct:**

```ts
BullModule.registerQueue({
  name: 'webhooks',
  defaultJobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 2_000 } },
})

async process(job: Job<WebhookJob>) {
  const res = await post(job.data)
  if (res.status >= 400 && res.status < 500 && res.status !== 429) throw new UnrecoverableError(`rejected ${res.status}`)
  if (!res.ok) throw new Error(`retryable ${res.status}`)
}
```

Reference: https://docs.bullmq.io/guide/retrying-failing-jobs
