---
id: bull-retention-bounded
title: Bound completed and failed job retention with removeOnComplete and removeOnFail
impact: MEDIUM
impactDescription: "every finished job stays in Redis until memory fills and noeviction starts rejecting new jobs"
roles: [implementer, reviewer]
tags: queues, bullmq
---
BullMQ keeps completed and failed jobs indefinitely unless told otherwise. Set `removeOnComplete` and `removeOnFail` to `{ age }` (seconds) and/or `{ count }` in `defaultJobOptions`, keeping failed jobs longer than completed ones so they can be inspected. Under the `noeviction` policy BullMQ requires, a full Redis rejects writes instead of dropping old jobs.

**Incorrect:**

```ts
defaultJobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 2_000 } }
```

**Correct:**

```ts
defaultJobOptions: {
  attempts: 5,
  backoff: { type: 'exponential', delay: 2_000 },
  removeOnComplete: { age: 86_400, count: 1_000 },
  removeOnFail: { age: 7 * 86_400 },
}
```

Reference: https://docs.bullmq.io/guide/queues/auto-removal-of-jobs
