---
id: prisma-no-raw-unsafe
title: Use $queryRaw tagged templates; never $queryRawUnsafe, $executeRawUnsafe or Prisma.raw with input
impact: CRITICAL
impactDescription: "SQL injection from any request string that reaches the query"
roles: [implementer, reviewer, security]
check: "rg -n '\$(queryRaw|executeRaw)Unsafe|Prisma\.raw\(' --glob '*.ts'"
tags: injection, prisma
---
Source: any request value. Sink: `$queryRawUnsafe`, `$executeRawUnsafe` or `Prisma.raw()`, which send the string as SQL. `$queryRaw` and `$executeRaw` used as tagged templates bind every `${}` as a parameter; compose fragments with `Prisma.sql` and lists with `Prisma.join`. Identifiers (a sort column, a direction) can't be parameters: map the input through a fixed object of `Prisma.sql` fragments.

**Incorrect:**

```ts
const rows = await prisma.$queryRawUnsafe(
  `SELECT * FROM "Order" WHERE "status" = '${status}' ORDER BY ${sort}`,
)
```

**Correct:**

```ts
const SORT = { newest: Prisma.sql`"createdAt" DESC`, total: Prisma.sql`"total" DESC` }
const rows = await prisma.$queryRaw<Order[]>`
  SELECT * FROM "Order" WHERE "status" = ${status} AND "orgId" = ${orgId}
  ORDER BY ${SORT[sort as keyof typeof SORT] ?? SORT.newest}`
```

Reference: https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries#sql-injection-prevention
