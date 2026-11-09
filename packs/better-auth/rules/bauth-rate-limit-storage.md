---
id: bauth-rate-limit-storage
title: Store rate limits in the database or secondary storage on serverless or multi-instance deploys
impact: HIGH
impactDescription: "each instance or cold start gets a fresh counter, so sign-in and OTP brute force is unlimited"
roles: [implementer, reviewer, security]
check: "rg -n -A6 'rateLimit' --glob '!node_modules'"
tags: auth, better-auth
---
better-auth rate-limits in production only, and in memory unless told otherwise. On Vercel, serverless or more than one instance, set `rateLimit.storage` to `'database'` or `'secondary-storage'`. Tighten `customRules` for sign-in, sign-up, password reset and OTP or magic-link endpoints the app enables.

**Incorrect:**

```ts
betterAuth({ rateLimit: { enabled: true } })
```

**Correct:**

```ts
betterAuth({
  rateLimit: {
    storage: 'database',
    customRules: { '/sign-in/email': { window: 60, max: 5 } },
  },
})
```

Reference: https://www.better-auth.com/docs/concepts/rate-limit
