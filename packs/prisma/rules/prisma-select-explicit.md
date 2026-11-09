---
id: prisma-select-explicit
title: Select the fields a response needs; never return a whole model or an unbounded include
impact: HIGH
impactDescription: "passwordHash, tokens and every column added later ship in API responses"
roles: [implementer, reviewer, security]
tags: exposure, prisma
---
Source: the database row. Sink: the HTTP response, a log line or a job payload. A model returned as-is exposes every scalar, including ones added next year; `include: { author: true }` pulls the related user's full row. Queries whose result leaves the service use `select` (nested `select` for relations) or map to a DTO. `include` is for internal code that needs the whole relation, and list relations get a `take`.

**Incorrect:**

```ts
return prisma.post.findMany({ where: { orgId }, include: { author: true, comments: true } })
```

**Correct:**

```ts
return prisma.post.findMany({
  where: { orgId },
  select: { id: true, title: true, author: { select: { id: true, name: true } }, _count: { select: { comments: true } } },
  take: 50,
})
```

Reference: https://www.prisma.io/docs/orm/prisma-client/queries/select-fields
