---
id: search-admin-key-server
title: Keep admin and master keys server-side; give browsers scoped search-only keys
impact: CRITICAL
impactDescription: "anyone with the bundle can read every index, delete it or rewrite its documents"
roles: [implementer, reviewer, security]
check: "rg -n -e 'NEXT_PUBLIC_[A-Z_]*(MEILI|TYPESENSE|ALGOLIA|ELASTIC|SEARCH)[A-Z_]*(ADMIN|MASTER|WRITE)' -e 'VITE_[A-Z_]*(ADMIN|MASTER)_KEY' --glob '!node_modules'"
tags: search, secrets
---
Source: the search engine's master, admin or write key. Sink: client JavaScript. Browser search uses a key restricted to search on specific indexes, ideally scoped per tenant: a Meilisearch tenant token, a Typesense scoped key (`generateScopedSearchKey`), an Algolia secured API key. Elastic and OpenSearch are queried only from the server.

**Incorrect:**

```ts
const client = new MeiliSearch({ host, apiKey: process.env.NEXT_PUBLIC_MEILI_MASTER_KEY })
```

**Correct:**

```ts
const { token } = await fetch('/api/search-token').then((r) => r.json())
const client = new MeiliSearch({ host, apiKey: token })
```

Reference: https://www.meilisearch.com/docs/learn/security/multitenancy_tenant_tokens
