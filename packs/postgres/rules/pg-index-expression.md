---
id: pg-index-expression
title: Match the index to the query's expression or predicate with expression and partial indexes
impact: MEDIUM
impactDescription: "WHERE lower(email) = $1 scans the table despite an index on email, and soft-deleted rows block re-signup"
roles: [implementer, reviewer]
tags: indexes, postgres
---
An index on `email` does not serve `lower(email) = $1`; index the expression itself (or use `citext`). A partial index (`WHERE deleted_at IS NULL`, `WHERE status = 'pending'`) covers only the rows queries look at, and a partial unique index enforces uniqueness among live rows, so a soft-deleted account doesn't block re-registration. The planner uses a partial index only when the query's `WHERE` implies the index predicate.

**Incorrect:**

```sql
CREATE UNIQUE INDEX users_email_key ON users (email);
SELECT id FROM users WHERE lower(email) = lower($1) AND deleted_at IS NULL;
```

**Correct:**

```sql
CREATE UNIQUE INDEX users_email_live_key ON users (lower(email)) WHERE deleted_at IS NULL;
```

Reference: https://www.postgresql.org/docs/current/indexes-partial.html
