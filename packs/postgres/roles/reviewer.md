# postgres · reviewer
Applies when: a Postgres driver is a dependency
Read order: pg-rls-forced, pg-vector-tenant-filter, pg-index-concurrently, pg-timestamptz, pg-vector-index, pg-index-expression

## Blocker vs should-fix
- Blocker: an RLS table without `FORCE`, or a tenant set with session-level `SET` behind a pool; a vector query without the tenant in `WHERE`; a plain `CREATE INDEX`, or an `ALTER` that rewrites the table, on a table the schema or brief shows is large and live.
- Should-fix: a new `timestamp` column for an instant; an embedding column with no vector index, or an operator class that doesn't match the query's operator; case-insensitive lookups without an expression index.
- Nit: a full index where a partial one matches every query in the diff.
