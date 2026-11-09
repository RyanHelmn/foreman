---
id: gen-ssrf-allowlist
title: Fetch user-supplied URLs only through an allowlist that blocks private ranges
impact: HIGH
impactDescription: "the server is used to reach internal services or cloud metadata"
roles: [implementer, reviewer, security]
tags: general
---
Source: a URL from a user (webhook target, importer, image proxy, link preview). Sink: a server-side fetch. Check the scheme, resolve the host, reject private, loopback and link-local addresses, and do not follow redirects to them.

**Incorrect:**

```ts
const res = await fetch(req.body.imageUrl)
```

**Correct:**

```ts
const url = await assertPublicHttpUrl(req.body.imageUrl)
const res = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(5000) })
```
