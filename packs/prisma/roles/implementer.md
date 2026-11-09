# prisma · implementer
Applies when: `prisma` or `@prisma/client` is a dependency, or a `schema.prisma` exists
Read order: prisma-no-raw-unsafe, prisma-tenant-filter, prisma-select-explicit, prisma-transaction-multi-write, prisma-tx-short, prisma-migrate-not-push, prisma-index-fk, prisma-money-decimal

## Iron laws
- No `$queryRawUnsafe`, `$executeRawUnsafe` or `Prisma.raw` with any value derived from input. Thinking "it's only a sort param"? That is the bug.
- Every write on a tenant-owned model carries the tenant in its `where`. Thinking "ids are UUIDs, nobody can guess them"? That is the bug.

## Deviation rules
- Schema change: run `npx prisma migrate dev --create-only --name <change>`, read the generated SQL, then apply it; the migration folder is part of your files.
- A generated migration that drops a column with data, or a rename that Prisma emitted as DROP + ADD: edit it to `RENAME COLUMN` or stop and report; never apply data loss silently.
- Run `npx prisma generate` after a schema change before typechecking.

## Output additions
- Migration: folder name, and whether it drops, renames or rewrites a column.
- Raw SQL added: `file:line` for each `$queryRaw`/`$executeRaw`.

## Obstacles to report
- No database reachable for `migrate dev` (it also needs to create a shadow database): report it; don't hand-write migration SQL from memory.
- `migrate dev` asking to reset the database means drift: report it, never accept the reset.
- Tenancy or soft-delete enforced by a `$extends` client: name which client you used.
