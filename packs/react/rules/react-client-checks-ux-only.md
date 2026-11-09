---
id: react-client-checks-ux-only
title: Treat role and permission checks in components as UX, and enforce them on the server
impact: CRITICAL
impactDescription: "any user calls the endpoint behind the hidden button directly"
roles: [reviewer, security]
tags: security, authz, react
---
Hiding a button, a route or a form field in the client changes what users see, not what they can do. Every action gated in the UI needs the same check in the handler it calls (API route, Server Action, loader). Flag a diff that adds a UI gate whose server path has no matching check.

**Incorrect (the only check is in the component):**

```tsx
{user.role === 'admin' && <button onClick={() => api.delete(`/users/${id}`)}>Delete</button>}
```

```ts
router.delete('/users/:id', requireSession, async (req, res) => { await db.user.delete({ where: { id: req.params.id } }) })
```

**Correct:**

```ts
router.delete('/users/:id', requireSession, requireRole('admin'), async (req, res) => { … })
```
