---
id: nest-thin-controller
title: Controllers map HTTP to one service call; no queries or business rules in them
impact: MEDIUM
impactDescription: "logic in a controller can't be reused by a queue processor, gateway or CLI and gets copied instead"
roles: [implementer, reviewer]
check: "rg -n 'this\.prisma\.' --glob '*.controller.ts' src/"
tags: structure, nestjs
---
A handler reads params, body and the current user, calls one service method and returns its result. Prisma calls, branching on business state, loops over records and calls to third-party clients belong in the service, where processors and gateways call the same code. Response shaping is a DTO or an interceptor, not inline mapping in the handler.

**Incorrect:**

```ts
@Post(':id/cancel')
async cancel(@Param('id') id: string, @CurrentUser() user: SessionUser) {
  const sub = await this.prisma.subscription.findFirst({ where: { id, userId: user.id } })
  if (sub?.status !== 'active') throw new BadRequestException()
  await this.stripe.subscriptions.cancel(sub.stripeId)
  return this.prisma.subscription.update({ where: { id }, data: { status: 'canceled' } })
}
```

**Correct:**

```ts
@Post(':id/cancel')
cancel(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: SessionUser) {
  return this.subscriptions.cancel(user.id, id)
}
```
