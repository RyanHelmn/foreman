---
id: next-route-handler-auth
title: Check the session in every exported method of a route handler
impact: CRITICAL
impactDescription: "the new method on an existing route.ts ships without authentication"
roles: [implementer, reviewer, security]
check: "rg -n 'export (async )?function (GET|POST|PUT|PATCH|DELETE)' --glob '**/route.{ts,js}'"
tags: auth, nextjs, route-handlers
---
Source: the request to `app/**/route.ts`. Sink: the data the method reads or writes. Each exported `GET`, `POST`, `PATCH`, `DELETE` is a separate entry point; a check in `POST` does not cover a `DELETE` added later. Read the session at the top of each method (or through one shared helper) and return 401/403 before touching data. Public handlers (webhooks, health) say why in the diff.

**Incorrect:**

```ts
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return new Response(null, { status: 401 })
  …
}
export async function DELETE(req: Request) {
  await db.apiKey.deleteMany({ where: { id: (await req.json()).id } })
  return new Response(null, { status: 204 })
}
```

**Correct:**

```ts
export async function DELETE(req: Request) {
  const session = await auth()
  if (!session) return new Response(null, { status: 401 })
  const { id } = DeleteKey.parse(await req.json())
  await db.apiKey.deleteMany({ where: { id, userId: session.user.id } })
  return new Response(null, { status: 204 })
}
```
