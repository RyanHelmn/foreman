# prisma gotchas

- [gotcha] Interactive $transaction defaults to timeout 5000 ms and maxWait 2000 ms; bulk work inside one is rolled back mid-way unless you pass { timeout } · paths: **/*.ts
- [gotcha] On PostgreSQL, DateTime maps to timestamp(3) without time zone; add @db.Timestamptz(3) for instants · paths: **/*.prisma
- [gotcha] Renaming a field in schema.prisma generates DROP COLUMN plus ADD COLUMN; edit the migration to ALTER TABLE ... RENAME COLUMN before applying it · paths: **/migrations/**/*.sql
- [gotcha] Prisma creates no index on relation scalars for PostgreSQL; add @@index([fooId]) yourself · paths: **/*.prisma
- [gotcha] A client from $extends is a new object; code that injects the base PrismaService skips the extension's tenancy or soft-delete filters · paths: **/*.ts
- [gotcha] $queryRaw returns database column names and types (bigint as BigInt, numeric as Decimal), not the model's mapped field names · paths: **/*.ts
- [gotcha] Editing a migration that was already applied changes its checksum; migrate dev then reports it modified and offers to reset the database · paths: **/migrations/**/*.sql
