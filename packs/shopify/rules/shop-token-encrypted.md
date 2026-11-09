---
id: shop-token-encrypted
title: Encrypt per-shop access tokens at rest and never return them to a client
impact: HIGH
impactDescription: "one database dump or log leak gives Admin API access to every installed store"
roles: [implementer, reviewer, security]
check: "rg -n 'accessToken' --glob '!node_modules' --glob '!*.test.*'"
tags: shopify, secrets
---
Source: the offline token from OAuth. Sink: the session table, logs, API responses, analytics. The default Prisma session storage writes `accessToken` in plain text. Encrypt the column with a key from the environment (or use database-level encryption the project already has), keep it out of logs, and never include the session row in a loader's response.

**Incorrect:**

```ts
export async function loader({ request }) {
  const { session } = await authenticate.admin(request)
  return { session }
}
```

**Correct:**

```ts
export async function loader({ request }) {
  const { session } = await authenticate.admin(request)
  return { shop: session.shop }
}
```

Reference: https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens
