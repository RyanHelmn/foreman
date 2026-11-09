---
id: nest-ownership-in-service
title: Pass the session user into service methods and scope the query by it
impactDescription: "a role guard lets any member read or edit another member's records by id"
impact: CRITICAL
roles: [implementer, reviewer, security]
tags: authz, nestjs
---
Guards see the route, not the record: `@Roles('member')` proves the caller may use the endpoint, not that invoice 42 is theirs. Every service method that loads or mutates by an id takes the acting user or tenant from `@CurrentUser()` as a parameter and puts it in the same `where`. A service method that takes only an id and is called from a controller is the finding: it will also be reused by the next route with a weaker guard.

**Incorrect:**

```ts
@Roles('member')
@Get(':id')
get(@Param('id') id: string) { return this.invoices.findById(id) }

findById(id: string) { return this.prisma.invoice.findUnique({ where: { id } }) }
```

**Correct:**

```ts
@Get(':id')
get(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: SessionUser) {
  return this.invoices.findForUser(user.id, id)
}

async findForUser(userId: string, id: string) {
  const invoice = await this.prisma.invoice.findFirst({ where: { id, ownerId: userId } })
  if (!invoice) throw new NotFoundException()
  return invoice
}
```
