---
id: node-body-limit
title: Raise body-size limits on the one route that needs it, never globally
impact: MEDIUM
impactDescription: "every endpoint accepts 50 MB bodies, so one client can exhaust memory"
roles: [implementer, reviewer, security]
check: "rg -n -e \"limit:\\s*'[0-9]+mb'\" -e 'bodyLimit:'"
tags: node, security
---
Express `express.json()` defaults to 100kb and Fastify to 1 MiB; Hono has no limit until `bodyLimit` from `hono/body-limit` is added. An upload or import route that needs more gets its own parser or limit on that route only. Large files go to object storage by signed URL, not through the JSON parser.

**Incorrect:**

```ts
app.use(express.json({ limit: '50mb' }))
```

**Correct:**

```ts
app.use(express.json())
app.post('/imports', express.json({ limit: '5mb' }), importHandler)
```
