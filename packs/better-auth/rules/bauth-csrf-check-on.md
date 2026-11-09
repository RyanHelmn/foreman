---
id: bauth-csrf-check-on
title: Never set advanced.disableCSRFCheck in a deployed config
impact: CRITICAL
impactDescription: "any site can submit sign-in, change-email or delete-account requests with the user's cookie"
roles: [implementer, reviewer, security]
check: "rg -n 'disableCSRFCheck' --glob '!node_modules'"
tags: auth, better-auth
---
Source: a cross-site form or fetch carrying the session cookie. Sink: any state-changing auth endpoint. better-auth validates the request origin and Fetch Metadata on mutations. Turning the check off to fix an "invalid origin" error removes CSRF protection; the fix is the missing entry in `trustedOrigins`. Cookie-authenticated routes you write yourself outside better-auth need their own CSRF defence.

**Incorrect:**

```ts
advanced: { disableCSRFCheck: true }
```

**Correct:**

```ts
trustedOrigins: ['https://app.example.com']
```

Reference: https://www.better-auth.com/docs/reference/security
