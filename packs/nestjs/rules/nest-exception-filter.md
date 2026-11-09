---
id: nest-exception-filter
title: Map persistence errors to HTTP in one global exception filter, not per-method try/catch
impact: HIGH
impactDescription: "a duplicate email or missing record returns 500 and pages on-call, and driver messages leak table names to clients"
roles: [implementer, reviewer]
tags: errors, nestjs
---
Register one filter with `APP_FILTER` that maps known persistence errors (Prisma `P2002` → 409, `P2025` → 404) to Nest exceptions and hands everything else to `BaseExceptionFilter`, which logs it and returns a generic 500. Services throw `NotFoundException`, `ConflictException` and friends; they don't wrap each call in try/catch, rethrow `InternalServerErrorException(e.message)`, or return `{ error }` objects. No response body carries a driver message or stack.

**Incorrect:**

```ts
async create(dto: CreateUserDto) {
  try { return await this.prisma.user.create({ data: dto }) }
  catch (e) { throw new InternalServerErrorException(e.message) }
}
```

**Correct:**

```ts
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaErrorFilter extends BaseExceptionFilter {
  catch(e: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const mapped: Record<string, HttpException> = { P2002: new ConflictException(), P2025: new NotFoundException() }
    super.catch(mapped[e.code] ?? e, host)
  }
}

providers: [{ provide: APP_FILTER, useClass: PrismaErrorFilter }]
```

Reference: https://docs.nestjs.com/exception-filters#inheritance
