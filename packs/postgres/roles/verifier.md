# postgres · verifier
Applies when: a Postgres driver is a dependency

## Commands
- Tests run against real Postgres of the production major version (Testcontainers or compose with `postgres:<major>`, or `pgvector/pgvector:pg<major>` when the vector extension is used), never SQLite or pg-mem.
- New hot query: `EXPLAIN (ANALYZE, BUFFERS) <query>` on seeded data; a `Seq Scan` on a large table goes in the report.
- After a concurrent index migration: `psql "$DATABASE_URL" -c "SELECT indexrelid::regclass FROM pg_index WHERE NOT indisvalid"` returns no rows.

## Known false negatives
- RLS tests pass when the test connects as a superuser or the table owner, because policies are skipped; run them as the app role.
- Tiny test tables get sequential scans anyway; `EXPLAIN` on near-empty tables proves nothing about index use.
