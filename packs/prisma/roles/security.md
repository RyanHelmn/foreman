# prisma · security
Applies when: `prisma` or `@prisma/client` is a dependency, or a `schema.prisma` exists
Read order: prisma-no-raw-unsafe, prisma-tenant-filter, prisma-select-explicit

## Also trace (no rule file yet)
- `where` built by spreading request input (`where: { ...req.query }`, `where: body.filter`): clients filter on any field and relation, and can probe hidden columns with `startsWith` (e.g. `{ user: { passwordHash: { startsWith: 'a' } } }`).
- Migration SQL that widens access: `GRANT`, `ALTER ROLE`, `DISABLE ROW LEVEL SECURITY`, `DROP POLICY`, or a new tenant table missing the tenant column or policy its neighbours have.
- Seed scripts (`prisma/seed.ts`): plaintext passwords, real API keys, known-password admin accounts that can reach non-local environments.
- `DATABASE_URL` for remote databases without `sslmode=require` or stricter.

## Commands
- `rg -n '\$(queryRaw|executeRaw)Unsafe|Prisma\.raw\(' --glob '*.ts'`
- `rg -n -i 'grant|row level security|policy|alter role' prisma/migrations/`
