---
id: expo-router-typed-routes
title: Navigate with typed Expo Router hrefs, not concatenated strings
impact: MEDIUM
impactDescription: "a renamed or moved screen leaves links that 404 at runtime instead of failing type-check"
roles: [implementer, reviewer]
check: "rg -n 'router\.(push|replace|navigate)\(`'"
tags: expo, router, typescript
---
With `experiments.typedRoutes` enabled, `href` and `router.push` are checked against the files in `app/`. String concatenation bypasses that check. Pass a `pathname` with params so a moved route fails `tsc`.

**Incorrect:**

```tsx
router.push(`/orders/${order.id}`)
```

**Correct:**

```tsx
router.push({ pathname: '/orders/[id]', params: { id: order.id } })
```

Reference: https://docs.expo.dev/router/reference/typed-routes/
