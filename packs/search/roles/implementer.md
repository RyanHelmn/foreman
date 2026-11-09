# search · implementer
Applies when: an Elasticsearch, OpenSearch, Meilisearch, Typesense or Algolia client is a dependency
Read order: search-admin-key-server, search-tenant-filter, search-no-pii, search-versioned-index

## Obstacles to report
- Meilisearch, Typesense and Algolia writes are asynchronous tasks; a test that searches straight after adding documents needs to wait for the task.
- A field must be declared filterable (Meilisearch `filterableAttributes`, Typesense schema `facet`/index) before a tenant filter on it works.
