---
id: rq-key-factory
title: Build query keys from one factory per domain
impact: HIGH
impactDescription: "an invalidation spelled differently from the query misses it, and the UI shows stale data after a save"
roles: [implementer, reviewer]
check: "rg -n \"queryKey: \\[['\\\"]\" --glob '*.{ts,tsx}'"
tags: react-query, keys
---
Keys are arrays, hierarchical from general to specific, and come from a factory next to the domain's hooks, so queries and invalidations share one spelling. Add new keys to the existing factory. With v5, `queryOptions()` can carry key and fetcher together.

**Incorrect:**

```ts
useQuery({ queryKey: ['invoice', id], queryFn: () => getInvoice(id) })
queryClient.invalidateQueries({ queryKey: ['invoices', id] })
```

**Correct:**

```ts
export const invoiceKeys = {
  all: ['invoices'] as const,
  list: (filters: InvoiceFilters) => [...invoiceKeys.all, 'list', filters] as const,
  detail: (id: string) => [...invoiceKeys.all, 'detail', id] as const,
}

useQuery({ queryKey: invoiceKeys.detail(id), queryFn: () => getInvoice(id) })
queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(id) })
```

Reference: https://tkdodo.eu/blog/effective-react-query-keys
