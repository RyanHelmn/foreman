---
id: node-graceful-shutdown
title: On SIGTERM, stop accepting connections, drain, close pools, then exit
impact: MEDIUM
impactDescription: "every deploy cuts in-flight requests and leaves jobs half-written"
roles: [implementer, reviewer]
check: "rg -n \"SIGTERM\""
tags: node, lifecycle
---
Platforms send SIGTERM and kill after a grace period. Handle it once at the entry point: `server.close()` (Fastify `app.close()`), wait for in-flight work, close the database pool and queue workers, then exit. Without a handler Node exits immediately on SIGTERM.

**Incorrect:**

```ts
app.listen(config.PORT)
```

**Correct:**

```ts
const server = app.listen(config.PORT)
process.once('SIGTERM', () => {
  server.close(async () => {
    await db.$disconnect()
    process.exit(0)
  })
})
```
