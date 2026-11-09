---
id: shop-theme-no-secrets
title: Keep Admin API tokens and private keys out of theme files and theme settings
impact: CRITICAL
impactDescription: "every storefront visitor can read the key from page source or settings_data.json"
roles: [implementer, reviewer, security]
check: "rg -n -e 'shpat_' -e 'shpss_' -e 'sk_live_' --glob '*.liquid' --glob '*.json' --glob 'assets/*'"
tags: shopify, liquid, secrets
---
Source: a token pasted into a theme setting, snippet or asset. Sink: rendered HTML and downloadable theme files. Everything a theme renders or ships is public. Only public tokens (Storefront API public token, publishable keys) belong there; calls needing a secret go through an app proxy or app backend.

**Incorrect:**

```liquid
<script>fetch('/admin/api/2024-10/orders.json', { headers: { 'X-Shopify-Access-Token': '{{ settings.admin_token }}' } })</script>
```

**Correct:**

```liquid
<script>fetch('/apps/my-app/orders')</script>
```

Reference: https://shopify.dev/docs/storefronts/themes/architecture/settings
