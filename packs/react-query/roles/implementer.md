# react-query · implementer
Applies when: `@tanstack/react-query`, `@tanstack/query-core` or `swr` is a dependency
Read order: rq-client-per-request, rq-key-includes-inputs, rq-key-factory, rq-optimistic-with-rollback, rq-narrow-invalidate, rq-no-copy-to-state, rq-stale-time-intentional

## Iron laws
- No module-level `QueryClient` in a server-rendered app. Thinking "it's only the provider file"? That is the bug.

## Deviation rules
- SWR projects: the same rules in SWR's terms: array keys (`useSWR(['/api/invoices', id], fetcher)`) built in one place, `mutate(key)` for the changed key only, `optimisticData` with `rollbackOnError: true`.
- Match the installed major version: v5 takes a single object (`useQuery({ queryKey, queryFn })`), uses `isPending` and `gcTime`; v4 code uses `isLoading` and `cacheTime`.
- Throw on non-2xx responses in the `queryFn`; `fetch` resolves on 404 and 500, and the query would cache the error body as data.

## Output additions
- Query keys added, and which mutations invalidate or update them.

## Obstacles to report
- No key factory exists yet: create one for the domain you touch only, and say so.
