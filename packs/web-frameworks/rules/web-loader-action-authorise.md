---
id: web-loader-action-authorise
title: Authorise inside every loader, action and server route, not in a parent layout
impact: CRITICAL
impactDescription: "the child route's data and mutations are reachable directly without a session"
roles: [implementer, reviewer, security]
tags: auth, remix, react-router, sveltekit, nuxt, astro
---
Source: a request to a route module. Sink: the data its loader returns or the write its action makes. Each is fetched on its own: Remix and React Router run loaders in parallel and serve them via `?_data`/`.data` URLs; SvelteKit `+server.ts` endpoints and form actions don't run the layout's `load`; Nuxt `server/api` handlers and Astro endpoints have no parent. Check the session in each handler (or in one server hook such as SvelteKit `handle` that covers every path) and scope queries to the user.

**Incorrect (only the parent route checks):**

```ts
// routes/_app.tsx
export async function loader({ request }: LoaderFunctionArgs) { return { user: await requireUser(request) } }
// routes/_app.billing.tsx
export async function loader() { return { invoices: await db.invoice.findMany() } }
```

**Correct:**

```ts
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)
  return { invoices: await db.invoice.findMany({ where: { orgId: user.orgId } }) }
}
```
