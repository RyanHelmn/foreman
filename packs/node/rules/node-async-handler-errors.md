---
id: node-async-handler-errors
title: In Express 4 and Koa-style wrappers, route rejected promises to the error handler
impact: HIGH
impactDescription: "a thrown error in an async handler leaves the request hanging until timeout, or crashes the process on unhandled rejection"
roles: [implementer, reviewer]
check: "rg -n -e '\\.(get|post|put|patch|delete)\\([^,]+,\\s*async' --glob '!**/*.test.*'"
tags: node, express
---
Express 4 does not catch a rejected promise from an async handler; the error never reaches error middleware. Express 5, Fastify, Hono and Koa forward rejections themselves. On Express 4, wrap every async handler with the project's `asyncHandler` (or `express-async-errors`, if installed) — check `express` in package.json before deciding.

**Incorrect (Express 4):**

```ts
router.get('/invoices/:id', async (req, res) => {
  res.json(await invoices.get(req.params.id))
})
```

**Correct:**

```ts
router.get('/invoices/:id', asyncHandler(async (req, res) => {
  res.json(await invoices.get(req.params.id))
}))
```
