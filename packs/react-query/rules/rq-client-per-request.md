---
id: rq-client-per-request
title: Create the QueryClient per request on the server, once per browser session on the client
impact: CRITICAL
impactDescription: "server-rendered pages share one cache, so one user's data renders in another user's HTML"
roles: [implementer, reviewer, security]
check: "rg -n '^(export )?const \\w+ = new QueryClient' --glob '*.{ts,tsx}'"
tags: react-query, ssr, security
---
Source: a query fetched during server rendering for the signed-in user. Sink: a module-level `QueryClient`, which lives for the whole server process. In SSR frameworks create it inside the component with `useState(() => new QueryClient())`, or with a `getQueryClient()` that returns a new client when `typeof window === 'undefined'` and a singleton in the browser. A module-level client is fine only in a client-only SPA.

**Incorrect:**

```tsx
const queryClient = new QueryClient()
export function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

**Correct:**

```tsx
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } }))
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

Reference: https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
