---
id: bauth-server-session-check
title: Check the session with auth.api.getSession on the server in every protected handler
impact: CRITICAL
impactDescription: "any visitor with a stale or forged cookie calls the protected action"
roles: [implementer, reviewer, security]
tags: auth, better-auth
---
Source: a request to a server action, route handler or API endpoint. Sink: the data or mutation behind it. `useSession()` on the client and `getSessionCookie()` in middleware only show the cookie exists; neither validates it. Each protected server entry point calls `auth.api.getSession({ headers })` and rejects when it returns null.

**Incorrect (middleware saw a cookie, so the action trusts the caller):**

```ts
export async function deleteProject(id: string) {
  'use server'
  await db.project.delete({ where: { id } })
}
```

**Correct:**

```ts
export async function deleteProject(id: string) {
  'use server'
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  await db.project.delete({ where: { id, ownerId: session.user.id } })
}
```

Reference: https://www.better-auth.com/docs/integrations/next
