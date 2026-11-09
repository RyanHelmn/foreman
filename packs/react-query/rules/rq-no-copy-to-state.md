---
id: rq-no-copy-to-state
title: Read query data directly instead of copying it into useState or a store
impact: MEDIUM
impactDescription: "the copy stops updating on refetch, so the screen shows data the cache has already replaced"
roles: [implementer, reviewer]
tags: react-query, state
---
The query cache is the server state. Derive from `data` in render or with `select`. A form that edits server data initialises its state once from the loaded data (`defaultValues`, or a child rendered with `key={data.id}`) rather than syncing in an effect. Never mirror query results into Zustand, Redux or context.

**Incorrect:**

```tsx
const { data } = useInvoices()
const [invoices, setInvoices] = useState<Invoice[]>([])
useEffect(() => { if (data) setInvoices(data) }, [data])
```

**Correct:**

```tsx
const { data: overdue = [] } = useInvoices({ select: (all) => all.filter((i) => i.overdue) })
```
