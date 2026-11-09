---
id: nest-guard-global
title: Register the auth guard as APP_GUARD and opt routes out with @Public()
impact: CRITICAL
impactDescription: "every controller that forgets @UseGuards is reachable without a session"
roles: [implementer, reviewer, security]
tags: auth, nestjs
---
Deny by default: provide the session guard as `APP_GUARD` in a module and have it skip only handlers or classes marked `@Public()`, read with `reflector.getAllAndOverride` over both handler and class. `app.useGlobalGuards()` in `main.ts` cannot inject providers and is absent from e2e apps built with `Test.createTestingModule`, so a missing guard still passes CI. A new route with no global guard behind it and no explicit `@Public()` is a blocker.

**Incorrect (per-controller guards; the next controller forgets):**

```ts
@UseGuards(SessionGuard)
@Controller('invoices')
export class InvoicesController {}

@Controller('exports')
export class ExportsController {}
```

**Correct:**

```ts
providers: [{ provide: APP_GUARD, useClass: SessionGuard }]

canActivate(ctx: ExecutionContext) {
  const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [ctx.getHandler(), ctx.getClass()])
  if (isPublic) return true
  return this.auth.validate(ctx.switchToHttp().getRequest())
}

@Public()
@Post('login')
login(@Body() body: LoginDto) {}
```

Reference: https://docs.nestjs.com/security/authentication#enable-authentication-globally
