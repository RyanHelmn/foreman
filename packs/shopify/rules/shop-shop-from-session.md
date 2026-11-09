---
id: shop-shop-from-session
title: Take the shop from the authenticated session, never from a shop query parameter
impact: CRITICAL
impactDescription: "a caller passes another shop's domain and acts with that merchant's access token"
roles: [implementer, reviewer, security]
check: "rg -n -e \"searchParams.get\\('shop'\\)\" -e 'req.query.shop' --glob '!node_modules'"
tags: shopify, auth
---
Source: `?shop=` in a URL, a header or a body field. Sink: loading that shop's offline session and calling the Admin API. In an embedded app, every loader and action calls `authenticate.admin(request)`, which validates the session token, and uses the `session.shop` and `admin` client it returns. The query parameter is only trusted during OAuth, where the library verifies it.

**Incorrect:**

```ts
export async function loader({ request }) {
  const shop = new URL(request.url).searchParams.get('shop')!
  const session = await sessionStorage.findSessionsByShop(shop)
  return fetchOrders(session[0])
}
```

**Correct:**

```ts
export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request)
  return fetchOrders(admin, session.shop)
}
```

Reference: https://shopify.dev/docs/apps/build/authentication-authorization/session-tokens
