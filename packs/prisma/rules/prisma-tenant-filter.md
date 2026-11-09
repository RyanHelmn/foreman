---
id: prisma-tenant-filter
title: Put the owner or tenant in the where of every update, delete, updateMany and deleteMany
impact: CRITICAL
impactDescription: "one request edits or deletes rows belonging to every tenant"
roles: [implementer, reviewer, security]
tags: tenancy, prisma
---
Source: an id or filter from the request. Sink: a Prisma write. Since Prisma 5, `update`, `delete` and `findUnique` accept non-unique fields next to the unique one, so put the tenant in that `where` (a miss throws `P2025`) instead of a separate read then write. `updateMany`/`deleteMany` with a `where` built only from request filters touch every tenant's rows, and an empty filter touches the whole table. Where tenancy or soft delete is enforced centrally (a `$extends` query extension or a repository), new code goes through that client; `$queryRaw` and the bare base client bypass it.

**Incorrect:**

```ts
await prisma.invoice.update({ where: { id }, data: dto })
await prisma.invoice.deleteMany({ where: { status: 'draft' } })
```

**Correct:**

```ts
await prisma.invoice.update({ where: { id, orgId: session.orgId }, data: dto })
await prisma.invoice.deleteMany({ where: { orgId: session.orgId, status: 'draft' } })
```

Reference: https://www.prisma.io/docs/orm/reference/prisma-client-reference#filter-on-non-unique-fields-with-userwhereuniqueinput
