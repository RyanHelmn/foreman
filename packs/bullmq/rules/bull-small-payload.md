---
id: bull-small-payload
title: Put ids in job data, never whole records, tokens or secrets
impact: CRITICAL
impactDescription: "access tokens and personal data sit in Redis in plain text and show in every dashboard and failed-job dump"
roles: [implementer, reviewer, security]
tags: queues, secrets, bullmq
---
Source: whatever the producer serialises into `queue.add`. Sink: Redis, where job data stays until the job is removed, and everything that reads it: queue dashboards, failed-job logs, Redis snapshots and backups. Pass ids and small scalars; the processor loads current state from the database, which also stops it acting on a stale copy. Tokens, API keys and passwords are loaded by the processor from config or an encrypted store, never carried in the job.

**Incorrect:**

```ts
await this.queue.add('sync', { user, accessToken: account.accessToken, rows: await this.prisma.row.findMany() })
```

**Correct:**

```ts
await this.queue.add('sync', { userId: user.id, accountId: account.id })
```
