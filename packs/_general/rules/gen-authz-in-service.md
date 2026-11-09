---
id: gen-authz-in-service
title: Check roles and permissions in the function that does the work, not only in middleware or the page
impact: CRITICAL
impactDescription: "the action is callable directly (API, server action, job) by anyone the page would have hidden it from"
roles: [implementer, reviewer, security]
tags: general
---
Source: any caller of the operation. Sink: the state change. Hiding a button or guarding a route group is UX; the service method, action or handler that performs the change checks the permission itself.

**Incorrect (only the admin page is guarded):**

```ts
export async function deleteUser(id: string) {
  await db.user.delete({ where: { id } })
}
```

**Correct:**

```ts
export async function deleteUser(session: Session, id: string) {
  assertRole(session, 'admin')
  await db.user.delete({ where: { id } })
}
```
