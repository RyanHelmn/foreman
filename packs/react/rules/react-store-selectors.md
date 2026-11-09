---
id: react-store-selectors
title: Read client stores through narrow selectors
impact: MEDIUM
impactDescription: "every component re-renders on any store change"
roles: [implementer, reviewer]
check: "rg -n 'use\\w*Store\\(\\)' --glob '*.{ts,tsx}'"
tags: react, state, zustand, redux
---
Zustand, Redux and Jotai re-render a subscriber when the value it selected changes. Selecting the whole store subscribes to everything. Select the field you render; for several fields, select each or use the library's shallow comparison (`useShallow` in Zustand). Store only source state; compute derived values in the selector.

**Incorrect:**

```tsx
const { items, addItem } = useCartStore()
```

**Correct:**

```tsx
const items = useCartStore((s) => s.items)
const addItem = useCartStore((s) => s.addItem)
const total = useCartStore((s) => s.items.reduce((n, i) => n + i.price, 0))
```
