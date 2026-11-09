# shopify · reviewer
Applies when: a Shopify app package, `shopify.app.toml`, or a theme (`layout/theme.liquid`) is present
Read order: shop-shop-from-session, shop-webhook-hmac-raw-body, shop-app-proxy-signature, shop-server-side-prices, shop-theme-no-secrets, shop-token-encrypted, shop-idempotent-events, shop-gdpr-webhooks, shop-liquid-escape, shop-minimal-scopes

## Blocker vs should-fix
- Blocker: a route without its `authenticate.*` call; any request-supplied shop, customer id or price reaching a query or mutation; a secret in a theme file; unescaped customer text in Liquid.
- Blocker: a GraphQL mutation whose `userErrors` are not checked.
- Should-fix: a webhook handler doing slow work before returning 200; a scope wider than the code uses.

## Obstacles to report
- A scope change in `shopify.app.toml`: every merchant must re-consent; call it out under Notes.
