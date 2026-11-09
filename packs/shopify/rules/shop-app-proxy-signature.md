---
id: shop-app-proxy-signature
title: Verify the app proxy signature before trusting logged_in_customer_id
impact: CRITICAL
impactDescription: "anyone calls the proxy URL directly and reads or changes another customer's data"
roles: [implementer, reviewer, security]
tags: shopify, app-proxy
---
Source: a storefront request forwarded through the app proxy, including `shop` and `logged_in_customer_id` query parameters. Sink: customer-scoped reads and writes. The proxy URL is public; only the `signature` parameter proves Shopify forwarded it. Call `authenticate.public.appProxy(request)` (Remix / React Router) or verify the HMAC yourself before reading any parameter.

**Incorrect:**

```ts
export async function loader({ request }) {
  const customerId = new URL(request.url).searchParams.get('logged_in_customer_id')
  return db.wishlist.findMany({ where: { customerId } })
}
```

**Correct:**

```ts
export async function loader({ request }) {
  await authenticate.public.appProxy(request)
  const customerId = new URL(request.url).searchParams.get('logged_in_customer_id')
  if (!customerId) return new Response(null, { status: 401 })
  return db.wishlist.findMany({ where: { customerId } })
}
```

Reference: https://shopify.dev/docs/apps/build/online-store/app-proxies/authenticate-app-proxies
