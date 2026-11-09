---
id: react-hooks-per-domain
title: Wrap data access in a hook per domain instead of calling the client in components
impact: MEDIUM
impactDescription: "the same endpoint is fetched with different keys, shapes and error handling in every component"
roles: [implementer, reviewer]
tags: react, structure
---
Components call `useInvoices()`, `useUpdateInvoice()`; the hook owns the URL, query key, parsing and cache updates. A component that calls `fetch`, `axios` or `useQuery` with an inline key duplicates that knowledge and breaks the first time the endpoint changes. Extend the existing domain hook file before adding a new one.

**Incorrect:**

```tsx
const { data } = useQuery({ queryKey: ['inv', id], queryFn: () => fetch(`/api/invoices/${id}`).then((r) => r.json()) })
```

**Correct:**

```tsx
const { data: invoice } = useInvoice(id)
```
