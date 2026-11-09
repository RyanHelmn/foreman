# react-query · security
Applies when: `@tanstack/react-query`, `@tanstack/query-core` or `swr` is a dependency
Read order: rq-client-per-request

## Also trace
- Persisted caches (`persistQueryClient`, `@tanstack/query-sync-storage-persister`, SWR `provider` backed by `localStorage`): which queries hold personal data, and whether logout clears the storage as well as the in-memory cache.
