---
id: bauth-secret-config
title: Load BETTER_AUTH_SECRET from the environment, distinct per environment
impact: HIGH
impactDescription: "a shared or committed secret lets anyone sign session cookies and verification tokens"
roles: [implementer, reviewer, security]
check: "rg -n -e 'secret:\\s*[\\x27\"]' -e 'BETTER_AUTH_SECRET=' --glob '!node_modules' --glob '!*.example'"
tags: auth, better-auth
---
The secret signs cookies and tokens. Read it from `BETTER_AUTH_SECRET` (at least 32 random characters, e.g. `openssl rand -base64 32`), never a literal or a fallback string, and never the same value in preview and production. Rotating it signs every user out.

**Incorrect:**

```ts
betterAuth({ secret: process.env.BETTER_AUTH_SECRET ?? 'dev-secret' })
```

**Correct:**

```ts
betterAuth({ secret: env.BETTER_AUTH_SECRET })
```

Reference: https://www.better-auth.com/docs/installation
