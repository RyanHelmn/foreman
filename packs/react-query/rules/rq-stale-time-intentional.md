---
id: rq-stale-time-intentional
title: Set staleTime deliberately, in the client defaults or per query
impact: MEDIUM
impactDescription: "the default of 0 refetches on every mount and window focus, and server-hydrated data refetches immediately"
roles: [implementer, reviewer]
tags: react-query, caching
---
`staleTime` defaults to 0, so every mount, focus and reconnect refetches. Set a default on the `QueryClient` (above 0 when data is prefetched on the server, or the client refetches it straight after hydration) and override per query for data that changes faster or never. Prefer `staleTime` over turning off `refetchOnWindowFocus`. SWR: `dedupingInterval` and `revalidateOnFocus` play the same role.

**Incorrect:**

```ts
const queryClient = new QueryClient()
useQuery({ queryKey: countryKeys.all, queryFn: getCountries, refetchOnWindowFocus: false })
```

**Correct:**

```ts
new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } })
useQuery({ queryKey: countryKeys.all, queryFn: getCountries, staleTime: Infinity })
```

Reference: https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults
