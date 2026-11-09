---
id: expo-public-env
title: Treat EXPO_PUBLIC_* as public; call third-party secret APIs through your backend
impact: CRITICAL
impactDescription: "any user can unzip the app and bill the third-party account with the extracted key"
roles: [implementer, reviewer, security]
check: "rg -n -i 'EXPO_PUBLIC_[A-Z_]*(SECRET|PRIVATE|SERVICE_ROLE)'"
tags: expo, secrets
---
Source: an environment variable. Sink: the JS bundle shipped to every device. Every `EXPO_PUBLIC_*` value, and anything read in `app.config.*` into `extra`, is inlined into the bundle. Only publishable identifiers belong there (API base URL, Stripe publishable key, Sentry DSN). Secret keys (OpenAI, Stripe secret, Supabase service role, Mapbox secret) stay on a backend endpoint that authenticates the user and calls the provider. EAS environment variables with secret visibility are for build steps, not for runtime JS.

**Incorrect:**

```ts
const openai = new OpenAI({ apiKey: process.env.EXPO_PUBLIC_OPENAI_KEY })
```

**Correct:**

```ts
const res = await api.post('/ai/complete', { prompt }) // backend holds the key and rate-limits per user
```

Reference: https://docs.expo.dev/guides/environment-variables/
