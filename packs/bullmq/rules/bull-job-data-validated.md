---
id: bull-job-data-validated
title: Parse job.data with a schema at the start of every processor
impact: HIGH
impactDescription: "a job queued by an older deploy or another service crashes the worker mid-way or writes undefined into the database"
roles: [implementer, reviewer, security]
tags: queues, validation, bullmq
---
Source: `job.data`, written by whatever reached the queue: an older release still draining, another service, anyone with Redis access. Sink: the processor's database writes and outbound calls. Parse it with the project's schema library first and throw `UnrecoverableError` on failure, so a malformed job fails once with a clear reason instead of retrying. When a job's shape changes, the processor accepts the old shape until queued jobs drain.

**Incorrect:**

```ts
async process(job: Job<{ invoiceId: string }>) {
  await this.billing.finalize(job.data.invoiceId)
}
```

**Correct:**

```ts
const FinalizeJob = z.object({ invoiceId: z.string().uuid() })

async process(job: Job) {
  const parsed = FinalizeJob.safeParse(job.data)
  if (!parsed.success) throw new UnrecoverableError(parsed.error.message)
  await this.billing.finalize(parsed.data.invoiceId)
}
```
