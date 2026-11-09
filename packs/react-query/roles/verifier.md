# react-query · verifier
Applies when: `@tanstack/react-query`, `@tanstack/query-core` or `swr` is a dependency

## Obstacles to report
- Tests sharing one `QueryClient` leak cached data between tests; each test needs a fresh client with `retry: false`, or failing queries retry with backoff and the test times out instead of showing the error state.
- SWR tests need `<SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>` for the same reason.
- A test that passes only because a previous test filled the cache: run the file alone (`npx vitest run <file>` / `npx jest <file>`) before calling it green.
