---
id: node-router-per-domain
title: One router or plugin per domain, mounted at its prefix in one place
impact: MEDIUM
impactDescription: "routes for one domain spread across files, so middleware and auth differ by accident"
roles: [implementer, reviewer]
tags: node, structure
---
Each domain owns a module exporting an Express `Router`, a Fastify plugin registered with `{ prefix }`, a Hono sub-app, or a tRPC router. The app file only mounts them. New routes go into the domain's router, not straight onto `app`.

**Incorrect:**

```ts
app.get('/api/invoices', listInvoices)
app.post('/api/invoices/:id/send', sendInvoice)
```

**Correct:**

```ts
// invoices/routes.ts
export const invoices = new Hono().get('/', listInvoices).post('/:id/send', sendInvoice)
// app.ts
app.route('/api/invoices', invoices)
```
