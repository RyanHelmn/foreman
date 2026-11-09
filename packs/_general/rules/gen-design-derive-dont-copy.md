---
id: gen-design-derive-dont-copy
title: Derive values from the source of truth instead of storing a copy
impact: MEDIUM
impactDescription: "the copy drifts and the UI or report shows stale data"
roles: [implementer, reviewer]
tags: general
---
Compute totals, counts, flags and filtered lists from the data they describe. Store a copy only with a stated reason (performance, history) and one owner that keeps it in sync.

**Incorrect:**

```ts
const [items, setItems] = useState(cart.items)
const [total, setTotal] = useState(sum(cart.items))
```

**Correct:**

```ts
const total = sum(cart.items)
```
