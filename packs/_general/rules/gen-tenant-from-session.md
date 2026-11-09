---
id: gen-tenant-from-session
title: Take the tenant from the session, never from the request
impact: CRITICAL
impactDescription: "one tenant reads or writes another tenant's data"
roles: [implementer, reviewer, security]
tags: general
---
Source: a tenant or organisation id in a header, query or body. Sink: any tenant-scoped query. Every tenant-scoped query filters by the tenant attached to the authenticated session.

**Incorrect:**

```ts
const orgId = req.headers['x-org-id']
return db.project.findMany({ where: { orgId } })
```

**Correct:**

```ts
return db.project.findMany({ where: { orgId: session.orgId } })
```
