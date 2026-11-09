---
id: sql-index-composite-order
title: Order composite index columns equality first, then the range or sort column
impact: MEDIUM
impactDescription: "the index exists but the planner uses only its first column or sorts in memory"
roles: [implementer, reviewer]
tags: indexes, sql
---
A B-tree index serves a query through its leading columns. Put columns compared with `=` first, then the one used in a range (`>`, `BETWEEN`) or `ORDER BY`, matching the sort direction. `(created_at, org_id)` can't serve `WHERE org_id = $1 ORDER BY created_at DESC LIMIT 50` well; `(org_id, created_at DESC)` serves it and any query on `org_id` alone, which makes a separate single-column `org_id` index redundant.

**Incorrect:**

```sql
CREATE INDEX events_created_org_idx ON events (created_at, org_id);
SELECT * FROM events WHERE org_id = $1 ORDER BY created_at DESC LIMIT 50;
```

**Correct:**

```sql
CREATE INDEX events_org_created_idx ON events (org_id, created_at DESC);
```
