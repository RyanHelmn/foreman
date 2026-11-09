---
id: node-error-handler
title: One central error handler maps known errors and hides internals on everything else
impact: HIGH
impactDescription: "stack traces, SQL and file paths reach the client, and each route invents its own error shape"
roles: [implementer, reviewer, security]
tags: node, errors
---
Register one handler: Express `app.use((err, req, res, next) => …)` after all routes, Fastify `setErrorHandler`, Hono `app.onError`, Koa a top `try/catch` middleware. It maps domain errors to status codes, logs the original with the request id, and returns a generic body for anything unknown. Handlers throw; they don't build error responses inline.

**Incorrect:**

```ts
} catch (err) {
  res.status(500).json({ error: err.message, stack: err.stack })
}
```

**Correct:**

```ts
app.onError((err, c) => {
  if (err instanceof NotFoundError) return c.json({ error: 'not_found' }, 404)
  logger.error({ err, requestId: c.get('requestId') })
  return c.json({ error: 'internal_error' }, 500)
})
```
