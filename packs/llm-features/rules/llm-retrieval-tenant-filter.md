---
id: llm-retrieval-tenant-filter
title: Put the tenant filter inside the vector query, not after it
impact: CRITICAL
impactDescription: "one tenant's question retrieves another tenant's documents into the answer"
roles: [implementer, reviewer, security]
tags: llm, retrieval, tenancy
---
Source: a user's query embedding. Sink: retrieved chunks placed in the prompt. Scope the search with a namespace or metadata filter from the session (`index.namespace(orgId)` in Pinecone, a `filter` on Qdrant, Chroma `where`, a `WHERE` in pgvector). Filtering after `topK` returns too few results and is one forgotten line from a leak. Tag every chunk with its tenant at ingest.

**Incorrect:**

```ts
const res = await index.query({ vector, topK: 20, includeMetadata: true })
const chunks = res.matches.filter((m) => m.metadata?.orgId === session.orgId)
```

**Correct:**

```ts
const res = await index.namespace(session.orgId).query({ vector, topK: 20, includeMetadata: true })
```

Reference: https://docs.pinecone.io/guides/index-data/implement-multitenancy
