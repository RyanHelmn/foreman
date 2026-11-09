---
id: nest-validation-pipe-whitelist
title: Register ValidationPipe with whitelist and forbidNonWhitelisted, and type every body and query as a DTO class
impact: CRITICAL
impactDescription: "a client sets role, ownerId or price by sending a field the DTO never declared"
roles: [implementer, reviewer, security]
check: "rg -n '@(Body|Query)\(\)[^,)]*: *(Partial<|Record<|any\b|\{)' src/"
tags: validation, nestjs
---
Source: request body and query. Sink: the service write. Register `new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` as `APP_PIPE`. The pipe only validates class-typed parameters: an interface, `Partial<Dto>`, `Record<…>`, inline type or `any` skips validation and passes the raw body through. `whitelist` keeps only properties with a class-validator decorator, so a field carrying only `@ApiProperty()` is stripped, or rejected under `forbidNonWhitelisted`; give every field a validator (`@IsOptional()` counts). For updates, `extends PartialType(CreateDto)` copies the validators and adds `@IsOptional()`, so partial bodies pass. Nested objects need `@ValidateNested()` plus `@Type(() => Child)` or their contents go unchecked.

**Incorrect (Partial<> is erased to Object; nothing is validated or stripped):**

```ts
@Patch(':id')
update(@Param('id') id: string, @Body() body: Partial<UpdateUserDto>) {
  return this.users.update(id, body)
}
```

**Correct:**

```ts
providers: [{ provide: APP_PIPE, useValue: new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }) }]

export class UpdateUserDto extends PartialType(CreateUserDto) {}

@Patch(':id')
update(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateUserDto, @CurrentUser() user: SessionUser) {
  return this.users.update(user.id, id, body)
}
```

Reference: https://docs.nestjs.com/techniques/validation#stripping-properties
