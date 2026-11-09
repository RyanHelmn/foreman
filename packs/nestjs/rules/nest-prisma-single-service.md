---
id: nest-prisma-single-service
title: Use one PrismaService from one global module; never new PrismaClient() in a provider
impact: HIGH
impactDescription: "each extra client opens its own connection pool and the database hits max connections under load"
roles: [implementer, reviewer]
check: "rg -n 'new PrismaClient\(' src/"
tags: prisma, nestjs
---
`PrismaService extends PrismaClient` and connects in `onModuleInit`; a `@Global()` `PrismaModule` provides and exports it once. A second `new PrismaClient()` in a service, helper or request-scoped provider multiplies the connection pool and bypasses any client extension (tenancy, soft delete) applied to the shared service. Tests replace it with `overrideProvider(PrismaService)`, not a new client.

**Incorrect:**

```ts
@Injectable()
export class ReportsService {
  private prisma = new PrismaClient()
}
```

**Correct:**

```ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() { await this.$connect() }
}

@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule {}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}
}
```

Reference: https://docs.nestjs.com/recipes/prisma
