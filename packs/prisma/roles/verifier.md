# prisma · verifier
Applies when: `prisma` or `@prisma/client` is a dependency, or a `schema.prisma` exists

## Commands
- `npx prisma validate`: schema parses and relations resolve; needs no database.
- `npx prisma generate` before typecheck when `schema.prisma` changed; a stale client gives false type errors or false passes.
- `npx prisma migrate status`: pending or failed migrations against the database in `DATABASE_URL`.
- Schema vs migrations: `npx prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --exit-code` (exit 2 = the schema has changes no migration covers; needs a shadow database). Flag names changed across Prisma versions (older releases spell the target `--to-schema-datamodel` and take `--shadow-database-url`); if a flag is rejected, check `npx prisma migrate diff --help` and report INCONCLUSIVE, not FAILED.
- Integration tests run against a throwaway Postgres (Testcontainers `@testcontainers/postgresql` if the project has it, otherwise its compose service) after `npx prisma migrate deploy`; never against a shared database.

## Known false negatives
- Unit tests that mock `PrismaService` don't exercise `where` clauses, unique constraints, cascades or transactions.
- `migrate status` reporting up to date says nothing about unmigrated `schema.prisma` changes; that is `migrate diff`.

## Obstacles to report
- `P1001` (can't reach database server): INCONCLUSIVE with the URL host, not FAILED.
