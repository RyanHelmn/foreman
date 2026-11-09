---
id: gen-match-neighbours
title: Follow the house pattern for each concern; a second way is a finding
impact: MEDIUM
impactDescription: "two ways to do one thing doubles what every future change must read"
roles: [implementer, reviewer]
tags: general
---
Data access, errors, validation, config, logging, API calls, forms, state and styling each have one house pattern in the project map. New code copies the exemplar, and naming, layout and test style follow the closest existing code.

**Incorrect (the house pattern is a typed client; this adds raw fetch):**

```ts
const res = await fetch(`/api/orders/${id}`).then(r => r.json())
```

**Correct:**

```ts
const order = await api.orders.get(id)
```
