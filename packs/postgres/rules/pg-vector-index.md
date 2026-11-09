---
id: pg-vector-index
title: Index embedding columns with HNSW or IVFFlat using the operator class of the query's distance operator
impact: HIGH
impactDescription: "every similarity search scores the whole table and latency grows linearly with rows"
roles: [implementer, reviewer]
tags: pgvector, postgres
---
Without an index, `ORDER BY embedding <=> $1 LIMIT k` computes the distance for every row. Create `USING hnsw` (no training step, better speed-recall trade-off, slower build) or `USING ivfflat` (build after the table has data, set `lists`). The operator class must match the query's operator, or the planner ignores the index: `vector_cosine_ops` for `<=>`, `vector_l2_ops` for `<->`, `vector_ip_ops` for `<#>`. The query must `ORDER BY` the distance expression with a `LIMIT`.

**Incorrect:**

```sql
CREATE INDEX ON chunks USING hnsw (embedding vector_l2_ops);
SELECT id FROM chunks WHERE org_id = $2 ORDER BY embedding <=> $1 LIMIT 10;
```

**Correct:**

```sql
CREATE INDEX CONCURRENTLY chunks_embedding_idx ON chunks USING hnsw (embedding vector_cosine_ops);
SELECT id FROM chunks WHERE org_id = $2 ORDER BY embedding <=> $1 LIMIT 10;
```

Reference: https://github.com/pgvector/pgvector#indexing
