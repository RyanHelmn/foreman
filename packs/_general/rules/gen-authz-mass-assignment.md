---
id: gen-authz-mass-assignment
title: Never pass a request body straight into a create or update
impact: CRITICAL
impactDescription: "a caller sets role, ownerId or price by adding a field"
roles: [implementer, reviewer, security]
tags: general
---
Source: the request body. Sink: a create or update that accepts every field. Pick the allowed fields explicitly, or validate against a schema that strips unknown keys.

**Incorrect (`{ "role": "admin" }` in the body promotes the caller):**

```ts
await db.user.update({ where: { id: session.userId }, data: req.body })
```

**Correct:**

```ts
const { name, avatarUrl } = UpdateProfile.parse(req.body)
await db.user.update({ where: { id: session.userId }, data: { name, avatarUrl } })
```
