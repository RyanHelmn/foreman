---
id: ts-floating-promise
title: Await, return or explicitly handle every promise
impact: HIGH
impactDescription: "the write may never happen, its error becomes an unhandled rejection, and the request returns before it finishes"
roles: [implementer, reviewer]
check: "rg -n -e 'forEach\\(async' --type ts"
tags: typescript, async
---
A promise that is neither awaited, returned, nor given a `.catch` is fire-and-forget by accident. `array.forEach(async …)` never waits. Intentional background work is marked with `void` and has its own `.catch`. With type-aware ESLint, `@typescript-eslint/no-floating-promises` and `no-misused-promises` catch this.

**Incorrect:**

```ts
ids.forEach(async (id) => { await sendReminder(id) })
audit.record(userId, 'login')
return res.json({ ok: true })
```

**Correct:**

```ts
await Promise.all(ids.map((id) => sendReminder(id)))
void audit.record(userId, 'login').catch((err) => logger.error({ err }, 'audit failed'))
return res.json({ ok: true })
```
