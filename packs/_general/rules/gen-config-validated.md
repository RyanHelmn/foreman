---
id: gen-config-validated
title: Read config from the environment once, validated at startup, through one typed accessor
impact: MEDIUM
impactDescription: "a missing variable fails at 3am on the first request that needs it"
roles: [implementer, reviewer]
check: "rg -n 'process\.env\.' --glob '!**/config*'"
tags: general
---
All environment reads live in one config module that validates and types them at boot. Everything else imports that module.

**Incorrect:**

```ts
const url = process.env.REDIS_URL!
```

**Correct:**

```ts
export const config = Env.parse(process.env)
const url = config.REDIS_URL
```
