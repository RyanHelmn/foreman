# prisma · reviewer
Applies when: `prisma` or `@prisma/client` is a dependency, or a `schema.prisma` exists
Read order: prisma-no-raw-unsafe, prisma-tenant-filter, prisma-select-explicit, prisma-transaction-multi-write, prisma-tx-short, prisma-migrate-not-push, prisma-index-fk, prisma-money-decimal

## Blocker vs should-fix
- Blocker: unsafe raw SQL with input; a tenant-model write without the tenant in `where`; a `schema.prisma` change with no migration; an edited migration that is already applied; `Float` for money; `this.prisma` used inside a `$transaction` callback.
- Should-fix: a whole model or unbounded `include` returned to a response; an external call inside an interactive transaction; a new relation scalar or filter field without `@@index`.
- Nit: `include` where a `select` of two fields would do, on internal code.

## Obstacles to report
- A change to `prisma/migrations/migration_lock.toml` provider means a database switch: list it under Notes as a decision.
