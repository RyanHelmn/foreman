---
id: node-route-schema
title: Attach a schema to every route or procedure in the framework's own validation slot
impact: HIGH
impactDescription: "an unvalidated field reaches the database or a query operator ({ \"$ne\": null })"
roles: [implementer, reviewer, security]
tags: node, validation
---
Use the framework's slot so validation can't be skipped by forgetting a line in the handler: Fastify `schema: { body, querystring, params }`, Hono `zValidator('json', Schema)`, tRPC `.input(Schema)`, Express a `validate(Schema)` middleware in the route definition. Params and query are validated too, not just body. Handlers read the parsed value, never raw `req.body`.

**Incorrect:**

```ts
app.post('/users', async (req, reply) => {
  return users.create(req.body)
})
```

**Correct:**

```ts
app.post('/users', { schema: { body: CreateUserBody } }, async (req, reply) => {
  return users.create(req.body)
})
```
