# shopify · implementer
Applies when: a Shopify app package, `shopify.app.toml`, or a theme (`layout/theme.liquid`) is present
Read order: shop-shop-from-session, shop-webhook-hmac-raw-body, shop-app-proxy-signature, shop-server-side-prices, shop-theme-no-secrets, shop-token-encrypted, shop-idempotent-events, shop-gdpr-webhooks, shop-liquid-escape, shop-minimal-scopes

## Iron laws
- Every app loader and action starts with the matching `authenticate.*` call (`admin`, `webhook`, `public.appProxy`) and uses the shop it returns. Thinking "the shop is in the URL anyway"? That is the bug.
- Prices, discounts and totals never come from the storefront. Thinking "the theme already computed it"? Look it up server-side.

## Deviation rules
- A new Admin API call needing a scope not in `shopify.app.toml`: report BLOCKED with the scope; don't add it.
- Webhook subscriptions belong in `shopify.app.toml`, not registered at runtime, unless the project already does otherwise.

## Output additions
- Scopes or webhook topics added: list them, or "none".

## Obstacles to report
- Admin GraphQL `userErrors` come back with HTTP 200; a mutation that ignores them reports success on failure.
- The app's API version is pinned in config; a field missing in that version fails at runtime, not at build.
