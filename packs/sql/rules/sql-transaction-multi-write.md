---
id: sql-transaction-multi-write
title: Run writes that must succeed together in one transaction on one connection
impact: HIGH
impactDescription: "a crash between two writes debits one account and never credits the other"
roles: [implementer, reviewer]
tags: transactions, sql
---
Dependent statements run between `BEGIN` and `COMMIT` on the same connection: with a pool, check out one client (or use the ORM's transaction callback) for the whole unit; `BEGIN` sent through a pool-level query helper lands on whichever connection is free. Read-then-write on the same rows either locks them with `SELECT … FOR UPDATE` or guards the `UPDATE` with the condition, and rolls back when the guarded `UPDATE` affects 0 rows.

**Incorrect:**

```sql
UPDATE accounts SET balance = balance - 100 WHERE id = $1;
UPDATE accounts SET balance = balance + 100 WHERE id = $2;
```

**Correct:**

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = $1 AND balance >= 100;
UPDATE accounts SET balance = balance + 100 WHERE id = $2;
COMMIT;
```
