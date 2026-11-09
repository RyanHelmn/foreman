---
id: rq-key-includes-inputs
title: Put every variable the query function reads into the query key
impact: HIGH
impactDescription: "changing a filter, page or user shows the cached result for the previous one"
roles: [implementer, reviewer]
tags: react-query, keys
---
The key is the cache identity. Any value the `queryFn` closes over (id, filters, page, locale, tenant) that is missing from the key means different requests share one cache entry and the query does not refetch when the value changes. `@tanstack/eslint-plugin-query`'s `exhaustive-deps` rule flags this when installed.

**Incorrect:**

```ts
useQuery({ queryKey: invoiceKeys.all, queryFn: () => listInvoices({ status, page }) })
```

**Correct:**

```ts
useQuery({ queryKey: invoiceKeys.list({ status, page }), queryFn: () => listInvoices({ status, page }) })
```

Reference: https://tanstack.com/query/latest/docs/eslint/exhaustive-deps
