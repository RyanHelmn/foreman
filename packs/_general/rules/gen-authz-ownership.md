---
id: gen-authz-ownership
title: Check ownership of every object id taken from the request
impact: CRITICAL
impactDescription: "any user reads or changes another user's records by changing an id (IDOR)"
roles: [implementer, reviewer, security]
tags: general
---
Source: an id in a path, query or body. Sink: a lookup or update by that id. Authentication proves who the caller is, not that the record is theirs; filter or check by the session's user or tenant in the same query.

**Incorrect (any signed-in user can read any invoice):**

```ts
const invoice = await db.invoice.findUnique({ where: { id: req.params.id } })
```

**Correct:**

```ts
const invoice = await db.invoice.findFirst({ where: { id: req.params.id, ownerId: session.userId } })
if (!invoice) throw new NotFound()
```

Reference: https://owasp.org/Top10/A01_2021-Broken_Access_Control/
