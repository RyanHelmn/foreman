---
id: next-public-env-only
title: Give the NEXT_PUBLIC_ prefix only to values safe to publish
impact: CRITICAL
impactDescription: "the secret is inlined into the JavaScript bundle every visitor downloads"
roles: [implementer, reviewer, security]
check: "rg -n 'NEXT_PUBLIC_\\w*(SECRET|PRIVATE|SERVICE_ROLE|_KEY|TOKEN|PASSWORD)'"
tags: security, nextjs, env
---
Source: an environment variable. Sink: the client bundle. Next.js replaces `process.env.NEXT_PUBLIC_*` with its literal value at build time in any code that reaches the browser. Only publishable values (public site URL, analytics id, publishable key) get the prefix. Secrets stay unprefixed and are read in server-only modules; mark those with `import 'server-only'` when the package is installed, so a client import fails the build.

**Incorrect:**

```ts
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!)
```

**Correct:**

```ts
import 'server-only'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
```

Reference: https://nextjs.org/docs/app/guides/environment-variables
