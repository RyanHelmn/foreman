---
id: sql-closed-set-constraint
title: Enforce closed sets, ranges and required fields in the schema with CHECK, enums and NOT NULL
impact: MEDIUM
impactDescription: "a script or old client writes 'cancelled' next to 'canceled' and every report splits the count"
roles: [implementer, reviewer]
tags: integrity, sql
---
A column holding a fixed set of values gets a `CHECK (col IN (…))` or a database enum; a column the code always expects gets `NOT NULL`; ranges (`quantity >= 0`, `ends_at > starts_at`) get a `CHECK`. Application validation alone lets backfills, scripts and other services write anything.

**Incorrect:**

```sql
CREATE TABLE orders (id bigint PRIMARY KEY, status text, quantity int);
```

**Correct:**

```sql
CREATE TABLE orders (
  id bigint PRIMARY KEY,
  status text NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void')),
  quantity int NOT NULL CHECK (quantity >= 0)
);
```
