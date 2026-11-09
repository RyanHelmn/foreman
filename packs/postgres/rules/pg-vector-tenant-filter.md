---
id: pg-vector-tenant-filter
title: Filter vector searches by tenant inside the SQL query, before LIMIT
impact: CRITICAL
impactDescription: "a search feeds another tenant's documents into the prompt, or returns fewer results than asked once filtered in code"
roles: [implementer, reviewer, security]
tags: pgvector, tenancy, postgres
---
Source: the user's query embedding. Sink: rows returned to the model or the user. The tenant and any access filter go in the `WHERE` of the similarity query; filtering the top-k in application code afterwards drops results, and one missed filter leaks. With HNSW the `WHERE` is applied to the candidates the index scan yields (`hnsw.ef_search`, default 40), so a selective filter can still return fewer than `LIMIT` rows: on pgvector 0.8+ set `hnsw.iterative_scan`, raise `ef_search`, or partition by tenant.

**Incorrect (top 10 across all tenants, filtered in code afterwards):**

```sql
SELECT id, org_id, content FROM chunks ORDER BY embedding <=> $1 LIMIT 10;
```

**Correct:**

```sql
BEGIN;
SET LOCAL hnsw.iterative_scan = relaxed_order;
SELECT id, content FROM chunks WHERE org_id = $2 ORDER BY embedding <=> $1 LIMIT 10;
COMMIT;
```

Reference: https://github.com/pgvector/pgvector#filtering
