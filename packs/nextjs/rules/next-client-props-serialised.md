---
id: next-client-props-serialised
title: Pass client components only the fields they render
impact: HIGH
impactDescription: "password hashes, tokens and internal fields are serialised into the page source"
roles: [implementer, reviewer, security]
tags: security, nextjs, rsc
---
Source: a database record or server object. Sink: props of a `"use client"` component, which are serialised into the RSC payload in the HTML (or `__NEXT_DATA__` in the Pages Router) and readable by anyone viewing the page. Select or map to the fields the component needs before crossing the boundary. Return values of Server Actions cross the same boundary.

**Incorrect:**

```tsx
const user = await db.user.findUnique({ where: { id } })
return <ProfileCard user={user} />
```

**Correct:**

```tsx
const user = await db.user.findUnique({ where: { id }, select: { name: true, avatarUrl: true } })
return <ProfileCard user={user} />
```

Reference: https://nextjs.org/docs/app/guides/data-security
