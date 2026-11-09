---
id: shop-liquid-escape
title: Escape user-controlled values in Liquid output
impact: HIGH
impactDescription: "a product review, customer note or URL parameter runs script on the storefront"
roles: [implementer, reviewer, security]
check: "rg -n '{{[^}|]*(customer|note|attributes|request|form\\.)[^}|]*}}' --glob '*.liquid'"
tags: shopify, liquid, xss
---
Source: customer-entered text (cart attributes and notes, form values), metafields edited by staff apps, `request` values. Sink: Liquid output in HTML, attributes or inline script. Liquid does not escape `{{ }}` output. Use `| escape` in HTML and attributes and `| json` inside `<script>`.

**Incorrect:**

```liquid
<p>Gift message: {{ cart.attributes.gift_message }}</p>
<script>const note = "{{ cart.note }}";</script>
```

**Correct:**

```liquid
<p>Gift message: {{ cart.attributes.gift_message | escape }}</p>
<script>const note = {{ cart.note | json }};</script>
```

Reference: https://shopify.dev/docs/api/liquid/filters/escape
