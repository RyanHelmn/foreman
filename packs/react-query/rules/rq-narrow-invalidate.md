---
id: rq-narrow-invalidate
title: Invalidate only the keys a mutation changed
impact: MEDIUM
impactDescription: "every active query refetches after each save, multiplying requests and flashing loading states"
roles: [implementer, reviewer]
check: "rg -n 'invalidateQueries\\(\\)' --glob '*.{ts,tsx}'"
tags: react-query, mutations
---
After a mutation, invalidate the detail key of the changed record and the list prefix it appears in, or write the server response into the cache with `setQueryData`. Calling `invalidateQueries()` with no filter, or with a root key shared by unrelated domains, refetches everything on screen.

**Incorrect:**

```ts
useMutation({ mutationFn: updateInvoice, onSuccess: () => queryClient.invalidateQueries() })
```

**Correct:**

```ts
useMutation({
  mutationFn: updateInvoice,
  onSuccess: (invoice) => {
    queryClient.setQueryData(invoiceKeys.detail(invoice.id), invoice)
    queryClient.invalidateQueries({ queryKey: [...invoiceKeys.all, 'list'] })
  },
})
```
