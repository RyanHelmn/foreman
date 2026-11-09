# search · security
Applies when: an Elasticsearch, OpenSearch, Meilisearch, Typesense or Algolia client is a dependency
Read order: search-admin-key-server, search-tenant-filter, search-no-pii

## Also trace (no rule file yet)
- Request strings interpolated into Meilisearch `filter` or Typesense `filter_by` expressions, or into Elastic `query_string`: filter injection that drops the tenant clause.
- Search engines exposed without auth (Elastic security off, Meilisearch without a master key) or on a public port.
