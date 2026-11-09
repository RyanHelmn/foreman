---
id: pg-index-concurrently
title: Build indexes on populated tables with CREATE INDEX CONCURRENTLY, outside a transaction
impact: HIGH
impactDescription: "a plain CREATE INDEX blocks every insert, update and delete on the table until the build finishes"
roles: [implementer, reviewer]
tags: migrations, postgres
---
`CREATE INDEX` holds a lock that blocks writes for the whole build. On any table with live traffic use `CREATE INDEX CONCURRENTLY` (and `DROP INDEX CONCURRENTLY`). It cannot run inside a transaction block, and most migration tools wrap each migration in one: put it in its own migration with the wrapping off (`disable_ddl_transaction!` in Rails, `op.get_context().autocommit_block()` in Alembic, a migration containing only that statement for tools that send a file as one implicit transaction). A failed concurrent build leaves an `INVALID` index; drop it and rerun. New indexes on tables created in the same migration don't need this.

**Incorrect:**

```sql
CREATE INDEX orders_customer_id_idx ON orders (customer_id);
```

**Correct:**

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS orders_customer_id_idx ON orders (customer_id);
```

Reference: https://www.postgresql.org/docs/current/sql-createindex.html#SQL-CREATEINDEX-CONCURRENTLY
