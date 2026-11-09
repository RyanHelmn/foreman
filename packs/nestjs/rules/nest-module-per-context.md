---
id: nest-module-per-context
title: One module per bounded context; other modules use only what it exports
impact: MEDIUM
impactDescription: "circular imports and forwardRef chains make a change in one context break another"
roles: [implementer, reviewer]
check: "rg -n 'forwardRef\(' src/"
tags: structure, nestjs
---
Each context (`billing`, `users`) owns its controllers, services and DTOs in one module and exports only the services other contexts may call. Another module importing a file from inside `billing/` (a repository, a private helper) or listing billing's providers in its own `providers` is the finding, and so is a new `forwardRef()`: break the cycle with an event, or move the shared piece into its own module that both import.

**Incorrect:**

```ts
import { InvoiceRepository } from '../billing/invoice.repository'

@Module({ imports: [forwardRef(() => BillingModule)], providers: [UsersService, InvoiceRepository] })
export class UsersModule {}
```

**Correct:**

```ts
@Module({ providers: [BillingService, InvoiceRepository], exports: [BillingService] })
export class BillingModule {}

@Module({ imports: [BillingModule], providers: [UsersService] })
export class UsersModule {}
```

Reference: https://docs.nestjs.com/modules#shared-modules
