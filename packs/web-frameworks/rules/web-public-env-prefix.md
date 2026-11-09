---
id: web-public-env-prefix
title: Give public env prefixes only to values safe to publish
impact: CRITICAL
impactDescription: "the secret is inlined into the client bundle every visitor downloads"
roles: [implementer, reviewer, security]
check: "rg -n '(VITE_|PUBLIC_|NUXT_PUBLIC_)\\w*(SECRET|PRIVATE|SERVICE_ROLE|TOKEN|PASSWORD)'"
tags: security, env, vite, sveltekit, nuxt, astro
---
Source: an environment variable. Sink: client JavaScript. Public prefixes are build-time inlined: `VITE_*` via `import.meta.env` (Vite, Remix, React Router), `PUBLIC_*` (SvelteKit `$env/*/public`, Astro), and Nuxt `runtimeConfig.public` / `NUXT_PUBLIC_*`. Secrets stay unprefixed and are read server-side: SvelteKit `$env/static/private`, Nuxt top-level `runtimeConfig`, `process.env` in `.server` modules.

**Incorrect:**

```ts
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY)
```

**Correct:**

```ts
// lib/supabase.server.ts
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
```

Reference: https://vite.dev/guide/env-and-mode
