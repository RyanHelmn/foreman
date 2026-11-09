---
id: bauth-trusted-origins
title: Set baseURL and list exact production origins in trustedOrigins
impact: CRITICAL
impactDescription: "a wildcard or dev origin lets another site make credentialed auth requests and pass callback redirects"
roles: [implementer, reviewer, security]
check: "rg -n -A6 'trustedOrigins' --glob '!node_modules'"
tags: auth, better-auth
---
Source: the `Origin` header and `callbackURL`/`redirectTo` parameters. Sink: better-auth's origin check and post-auth redirect. `trustedOrigins` is the allowlist for both. List each real frontend origin with its scheme, from config per environment; no bare `*`, no `http://localhost` in production, no broad subdomain wildcard over hosts you don't control.

**Incorrect:**

```ts
betterAuth({
  trustedOrigins: ['*', 'http://localhost:3000'],
})
```

**Correct:**

```ts
betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: env.AUTH_TRUSTED_ORIGINS.split(','),
})
```

Reference: https://www.better-auth.com/docs/reference/security
