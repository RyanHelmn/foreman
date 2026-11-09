---
id: gen-timeout-outbound
title: Put a timeout on every outbound call and bound every retry
impact: HIGH
impactDescription: "one slow dependency holds every worker and takes the service down"
roles: [implementer, reviewer]
tags: general
---
HTTP, database, queue and AI calls each get a timeout. Retries are bounded, use backoff with jitter, and only retry idempotent operations.

**Incorrect:**

```ts
const res = await fetch(url)
while (!res.ok) res = await fetch(url)
```

**Correct:**

```ts
const res = await retry(() => fetch(url, { signal: AbortSignal.timeout(5000) }), { attempts: 3, backoff: 'exponential' })
```
