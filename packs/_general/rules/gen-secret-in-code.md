---
id: gen-secret-in-code
title: Keep secrets out of code, fixtures, logs and client bundles
impact: CRITICAL
impactDescription: "a key in git history or a browser bundle is public and must be rotated"
roles: [implementer, reviewer, security]
check: "rg -n --hidden -e '(sk|pk)_(live|test)_' -e 'AKIA[0-9A-Z]{16}' -e '-----BEGIN [A-Z ]*PRIVATE KEY' ."
tags: general
---
Secrets come from the environment or a secret store at runtime. Never commit them, print them in errors or logs, ship them to the client, or paste them into API doc examples or test fixtures.

**Incorrect:**

```ts
const stripe = new Stripe('sk_live_51H…')
```

**Correct:**

```ts
const stripe = new Stripe(config.stripeSecretKey)
```
