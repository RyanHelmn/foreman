---
id: prisma-index-fk
title: Add @@index for every relation scalar and every field a new query filters or sorts on
impact: HIGH
impactDescription: "a lookup by orgId or userId scans the whole table once it grows"
roles: [implementer, reviewer]
tags: indexes, prisma
---
On PostgreSQL Prisma creates the foreign key but no index on the relation scalar (`orgId`); with `relationMode = "prisma"` there is no foreign key either. Add `@@index` for each relation scalar and each field a new query filters or sorts by, in query order: equality fields first, then the range or sort field. A composite index led by the relation scalar also covers lookups by that scalar alone. `@id`, `@unique` and `@@unique` already index their columns.

**Incorrect:**

```prisma
model Invoice {
  id        String   @id @default(uuid())
  orgId     String
  org       Org      @relation(fields: [orgId], references: [id])
  status    String
  createdAt DateTime @default(now())
}
```

**Correct:**

```prisma
model Invoice {
  id        String   @id @default(uuid())
  orgId     String
  org       Org      @relation(fields: [orgId], references: [id])
  status    String
  createdAt DateTime @default(now())

  @@index([orgId, status, createdAt])
}
```

Reference: https://www.prisma.io/docs/orm/prisma-schema/data-model/indexes
