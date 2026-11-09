---
id: next-loading-error-per-segment
title: Add loading.tsx and error.tsx to each segment that fetches data
impact: MEDIUM
impactDescription: "a slow query blanks the navigation, and one failed fetch replaces the whole app with the root error page"
roles: [implementer, reviewer]
tags: nextjs, ux
---
A route segment that awaits data gets a `loading.tsx` (or a `<Suspense>` boundary around the slow part) and an `error.tsx` so failure stays inside that segment. `error.tsx` must start with `"use client"` and offer `reset`. Use `notFound()` with `not-found.tsx` for missing records instead of throwing.

**Incorrect (new segment with a data fetch and no boundaries):**

```
app/projects/[id]/page.tsx
```

**Correct:**

```
app/projects/[id]/page.tsx
app/projects/[id]/loading.tsx
app/projects/[id]/error.tsx
```

```tsx
'use client'
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <button onClick={reset}>Try again</button>
}
```

Reference: https://nextjs.org/docs/app/api-reference/file-conventions/error
