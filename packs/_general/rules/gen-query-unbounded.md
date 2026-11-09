---
id: gen-query-unbounded
title: Paginate list queries and endpoints
impact: HIGH
impactDescription: "a list endpoint returns every row and times out as data grows"
roles: [implementer, reviewer]
tags: general
---
Every list query has a limit, and every list endpoint takes a cursor or page. Exports and batch jobs stream or chunk.

**Incorrect:**

```ts
return db.auditLog.findMany({ where: { orgId } })
```

**Correct:**

```ts
return db.auditLog.findMany({ where: { orgId }, take: 50, cursor: after ? { id: after } : undefined, orderBy: { id: 'asc' } })
```
