---
id: sql-migrations-only
title: Change the schema only through committed migration files, never edited once applied
impact: HIGH
impactDescription: "staging and production drift from the code, and the next deploy fails or runs against missing columns"
roles: [implementer, reviewer]
check: "rg -n 'synchronize:\s*true|drizzle-kit push|create_all\(' --glob '!**/node_modules/**'"
tags: migrations, sql
---
Every DDL change in a diff is a new migration file in the project's tool (Drizzle Kit, Kysely migrator, TypeORM, Knex, Alembic, Flyway). Schema sync shortcuts (TypeORM `synchronize: true`, `drizzle-kit push`, SQLAlchemy `metadata.create_all()`) and hand-run DDL never touch shared databases. A migration already applied anywhere is never edited; add a new one. A change that drops or rewrites a column with data ships as expand, deploy code, then contract, with the backfill in between.

**Incorrect (run by hand on staging, no file in the repo):**

```sql
ALTER TABLE orders ADD COLUMN discount numeric(12,2);
```

**Correct (migrations/20261109120000_add_order_discount.sql):**

```sql
ALTER TABLE orders ADD COLUMN discount numeric(12,2) NOT NULL DEFAULT 0;
```
