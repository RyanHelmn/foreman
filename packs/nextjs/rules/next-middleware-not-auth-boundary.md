---
id: next-middleware-not-auth-boundary
title: Enforce auth where data is read, not only in middleware or proxy
impact: CRITICAL
impactDescription: "a path the matcher misses, a prefetch, or a header bypass reaches the data unauthenticated"
roles: [implementer, reviewer, security]
check: "rg -n 'matcher' middleware.ts proxy.ts src/middleware.ts src/proxy.ts"
tags: auth, nextjs, middleware
---
`middleware.ts` (renamed `proxy.ts` in Next.js 16) is an optimistic redirect for UX. Matchers miss new routes and Server Action POSTs, and CVE-2025-29927 let an `x-middleware-subrequest` header skip middleware entirely on unpatched versions. Every page, route handler and action that reads private data checks the session itself, ideally through a data-access function that does it once.

**Incorrect (the page trusts that middleware ran):**

```tsx
export default async function BillingPage() {
  const invoices = await db.invoice.findMany()
  return <Invoices data={invoices} />
}
```

**Correct:**

```tsx
export default async function BillingPage() {
  const user = await requireUser()
  const invoices = await db.invoice.findMany({ where: { orgId: user.orgId } })
  return <Invoices data={invoices} />
}
```

Reference: https://nextjs.org/docs/app/guides/authentication
