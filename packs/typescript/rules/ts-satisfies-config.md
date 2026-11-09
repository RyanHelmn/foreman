---
id: ts-satisfies-config
title: Type config objects with satisfies, not an annotation
impact: LOW
impactDescription: "keys and literal values widen to string, so typos in lookups and routes compile"
roles: [implementer, reviewer]
tags: typescript
---
A `: Record<string, T>` annotation checks the object but throws away its keys and literal values. `satisfies T` checks the same constraint and keeps the inferred type, so `config.plans.pro` is known to exist and `config.plans.prp` fails.

**Incorrect:**

```ts
const plans: Record<string, Plan> = {
  free: { seats: 1 },
  pro: { seats: 10 },
}
plans.prp.seats
```

**Correct:**

```ts
const plans = {
  free: { seats: 1 },
  pro: { seats: 10 },
} satisfies Record<string, Plan>
```
