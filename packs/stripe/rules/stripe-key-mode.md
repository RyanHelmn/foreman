---
id: stripe-key-mode
title: Fail startup when the Stripe key mode doesn't match the environment
impact: HIGH
impactDescription: "production takes test payments that never settle, or a preview deploy charges real cards"
roles: [implementer, reviewer, security]
check: "rg -n 'sk_(live|test)_' --glob '!node_modules'"
tags: stripe, config
---
Each environment has its own secret key and its own `whsec_` per webhook endpoint. Validate at startup that production uses `sk_live_`/`rk_live_` and every other environment uses test keys. Webhook handlers that serve both check `event.livemode`.

**Incorrect:**

```ts
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
```

**Correct:**

```ts
const live = env.STRIPE_SECRET_KEY.startsWith('sk_live_') || env.STRIPE_SECRET_KEY.startsWith('rk_live_')
if (live !== (env.APP_ENV === 'production')) throw new Error('Stripe key mode does not match APP_ENV')
export const stripe = new Stripe(env.STRIPE_SECRET_KEY)
```

Reference: https://docs.stripe.com/keys
