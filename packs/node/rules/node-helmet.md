---
id: node-helmet
title: Set security headers with the framework's helmet equivalent
impact: MEDIUM
impactDescription: "responses lack HSTS, nosniff and frame-ancestors, so clickjacking and MIME sniffing stay open"
roles: [implementer, reviewer, security]
tags: node, security
---
Register once at app setup: Express `helmet()`, Fastify `@fastify/helmet`, Hono `secureHeaders()` from `hono/secure-headers`, Koa `koa-helmet`. Loosen a single directive (CSP for a docs page) on that route, not by removing the middleware. Only add the package if it is already a dependency or the brief lists it.

**Incorrect:**

```ts
const app = express()
app.use(express.json())
app.use('/api', api)
```

**Correct:**

```ts
const app = express()
app.use(helmet())
app.use(express.json())
app.use('/api', api)
```
