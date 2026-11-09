# react-query · reviewer
Applies when: `@tanstack/react-query`, `@tanstack/query-core` or `swr` is a dependency
Read order: rq-client-per-request, rq-key-includes-inputs, rq-key-factory, rq-optimistic-with-rollback, rq-narrow-invalidate, rq-no-copy-to-state, rq-stale-time-intentional

## Blocker vs should-fix
- Blocker: a shared `QueryClient` in SSR; a query key missing an input its `queryFn` reads; an optimistic cache write with no rollback; a mutation that changes data no query is invalidated or updated for.
- Should-fix: inline keys outside the factory; unfiltered `invalidateQueries()`; query data copied into state or a store; a `queryFn` that does not throw on HTTP errors.
- Nit: `staleTime` repeated per query where a client default would do.
