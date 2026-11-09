# postgres · implementer
Applies when: a Postgres driver is a dependency (`pg`, `postgres`, Neon, `psycopg`, `asyncpg`, `pgx`, `@prisma/adapter-pg`, `pgvector`)
Read order: pg-rls-forced, pg-vector-tenant-filter, pg-index-concurrently, pg-timestamptz, pg-vector-index, pg-index-expression

## Iron laws
- Queries on RLS tables and vector searches carry the tenant in SQL, set per transaction. Thinking "the retriever filters the results afterwards"? That is the bug.

## Deviation rules
- A new index on an existing table in your migration: use `CONCURRENTLY` in its own migration and say so.

## Output additions
- Migrations: for each, whether it takes a write-blocking lock on an existing table, and for how long it is expected to run.

## Obstacles to report
- "cannot run inside a transaction block": the migration tool wraps files in a transaction; report the workaround you used.
- `pgvector` not installed on the target database (`CREATE EXTENSION vector` needs the extension available on the server): report BLOCKED.
