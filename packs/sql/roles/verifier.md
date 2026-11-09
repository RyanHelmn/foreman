# sql · verifier
Applies when: a SQL driver or ORM is a dependency, or a pack extends this one

## Commands
- Apply all migrations to a fresh database before the suite, using the project's tool: `npx drizzle-kit migrate`, `npx knex migrate:latest`, `npx typeorm migration:run -d <data-source>`, `alembic upgrade head`.
- New migration reversible where the tool supports it: `alembic downgrade -1`, `npx knex migrate:rollback`, `npx typeorm migration:revert -d <data-source>`.
- Models vs migrations: `alembic check` (Alembic 1.9+) fails when autogenerate would produce operations; `npx drizzle-kit generate` reporting no schema changes means Drizzle schema and migrations agree (it writes a file otherwise; discard it and report drift).

## Known false negatives
- SQLite or an in-memory fake standing in for Postgres/MySQL: CHECK, enums, JSON operators, locking and collation differ; a green suite proves little about migrations or queries.
- Tests wrapped in a per-test rolled-back transaction never exercise commit-time behaviour and hide code that opens its own connection.
