# search · reviewer
Applies when: an Elasticsearch, OpenSearch, Meilisearch, Typesense or Algolia client is a dependency
Read order: search-admin-key-server, search-tenant-filter, search-no-pii, search-versioned-index

## Blocker vs should-fix
- Blocker: an admin key reachable from the client; a query on a shared index without the session tenant filter.
- Should-fix: whole rows indexed; a mapping changed in place without a reindex path.
