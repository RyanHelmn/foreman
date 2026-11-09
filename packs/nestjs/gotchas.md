# nestjs gotchas

- [gotcha] Register ThrottlerGuard as APP_GUARD after the auth guard; global guards run in registration order, so a per-user getTracker reading req.user sees no user and falls back to IP · paths: **/*.module.ts
- [gotcha] forbidNonWhitelisted rejects any DTO field without a class-validator decorator (only @ApiProperty or a bare type) with "property x should not exist"; PartialType keeps validators and adds @IsOptional, so partial updates pass, but a Partial<Dto> type skips validation entirely · paths: **/*.dto.ts
- [gotcha] Import PartialType, PickType and OmitType from @nestjs/swagger when the project uses Swagger; the @nestjs/mapped-types versions drop the OpenAPI metadata · paths: **/*.dto.ts
- [gotcha] With transformOptions.enableImplicitConversion, the query string "false" becomes true for boolean fields; convert explicitly with @Transform(({ value }) => value === 'true') · paths: **/*.dto.ts
- [gotcha] A Scope.REQUEST provider makes every provider that injects it request-scoped too, re-created on each request · paths: **/*.service.ts
- [gotcha] Pipes, guards and filters registered with app.useGlobal* in main.ts are absent from e2e apps built with Test.createTestingModule; register them as APP_PIPE, APP_GUARD, APP_FILTER · paths: **/main.ts
- [gotcha] onModuleDestroy and beforeApplicationShutdown only run on SIGTERM after app.enableShutdownHooks(); without it Prisma and BullMQ workers are killed mid-job · paths: **/main.ts
- [gotcha] reflector.get(KEY, ctx.getHandler()) ignores decorators on the controller class; use getAllAndOverride(KEY, [ctx.getHandler(), ctx.getClass()]) · paths: **/*.guard.ts
