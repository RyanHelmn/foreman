---
id: search-tenant-filter
title: Apply the tenant filter on every search query from the session
impact: CRITICAL
impactDescription: "a search box returns other customers' records"
roles: [implementer, reviewer, security]
tags: search, tenancy
---
Source: a search request. Sink: results from a shared index. Every query carries a tenant filter built from the session (Elastic/OpenSearch `bool.filter` term, Meilisearch or Typesense `filter`/`filter_by`), or uses a key that embeds it. Filters built from request strings are escaped or come from an allowlist.

**Incorrect:**

```ts
await es.search({ index: 'tickets', query: { match: { body: q } } })
```

**Correct:**

```ts
await es.search({
  index: 'tickets',
  query: { bool: { must: { match: { body: q } }, filter: { term: { orgId: session.orgId } } } },
})
```
