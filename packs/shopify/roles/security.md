# shopify · security
Applies when: a Shopify app package, `shopify.app.toml`, or a theme (`layout/theme.liquid`) is present
Read order: shop-shop-from-session, shop-webhook-hmac-raw-body, shop-app-proxy-signature, shop-server-side-prices, shop-theme-no-secrets, shop-token-encrypted, shop-liquid-escape, shop-minimal-scopes

## Also trace (no rule file yet)
- `app/uninstalled` and `shop/redact` delete that shop's sessions and tokens; a reinstall must not reuse an old token.
- Theme app extensions and app blocks: merchant-editable block settings rendered without `| escape`.
- Storefront JS that reads `window.location` or URL parameters into `innerHTML`.
- Billing: the plan and amount passed to `billing.request` come from server config, and gated features check `billing.check` server-side.

## Commands
- Run `npm audit --omit=dev` when a lockfile changed.
- Themes: run `shopify theme check` and read the security-related offences.
