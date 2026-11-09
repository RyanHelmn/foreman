---
id: web-server-only-modules
title: Keep database and secret-holding code in the framework's server-only modules
impact: HIGH
impactDescription: "server code and credentials end up in the browser bundle, or the build breaks on Node APIs"
roles: [implementer, reviewer, security]
tags: security, remix, react-router, sveltekit, nuxt
---
Source: a module holding a database client, API secret or Node-only API. Sink: an import chain that reaches client code. Put such code where the framework refuses client imports: `*.server.ts` or `.server/` (Remix, React Router), `$lib/server/` or `*.server.ts` (SvelteKit), `server/` and `*.server.vue` (Nuxt). Then a stray client import fails the build instead of shipping.

**Incorrect (imported by a component and by a loader):**

```ts
// app/lib/db.ts
export const db = new PrismaClient()
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
```

**Correct:**

```ts
// app/lib/db.server.ts
export const db = new PrismaClient()
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
```

Reference: https://svelte.dev/docs/kit/server-only-modules
