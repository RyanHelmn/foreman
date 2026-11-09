---
id: sql-index-filter-columns
title: Index foreign keys and every column a new query filters, joins or sorts on
impact: HIGH
impactDescription: "a lookup that took 1 ms at launch becomes a full table scan as the table grows"
roles: [implementer, reviewer]
tags: indexes, sql
---
PostgreSQL does not index foreign key columns automatically (MySQL InnoDB does), so joins on them and cascading deletes from the parent scan the child table. When a diff adds a `WHERE`, `JOIN … ON` or `ORDER BY` on a column, the same diff adds an index or names the existing index whose leading columns cover it. On realistic data, `EXPLAIN` showing `Seq Scan` (Postgres) or `type: ALL` (MySQL) on a large table is the finding.

**Incorrect:**

```sql
CREATE TABLE invoices (
  id uuid PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES orgs(id),
  status text NOT NULL
);
SELECT id FROM invoices WHERE org_id = $1 AND status = 'open';
```

**Correct:**

```sql
CREATE INDEX invoices_org_id_status_idx ON invoices (org_id, status);
```
