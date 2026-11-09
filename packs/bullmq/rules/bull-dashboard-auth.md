---
id: bull-dashboard-auth
title: Mount Bull Board or any queue dashboard behind admin authentication
impact: CRITICAL
impactDescription: "anyone with the URL reads every job payload and retries, promotes or deletes jobs"
roles: [implementer, reviewer, security]
tags: queues, auth, bullmq
---
Source: an anonymous HTTP request. Sink: the dashboard's routes, which read all job data and can retry, clean or remove jobs. Bull Board mounts its own router on the HTTP adapter with no auth, and Nest's `APP_GUARD` doesn't run for it. Put an admin-only middleware in front of its route (the `middleware` option of `BullBoardModule.forRoot`, or `app.use(path, adminOnly, router)`), or don't mount it in production.

**Incorrect:**

```ts
BullBoardModule.forRoot({ route: '/queues', adapter: ExpressAdapter })
```

**Correct:**

```ts
BullBoardModule.forRoot({ route: '/queues', adapter: ExpressAdapter, middleware: adminOnly })
```
