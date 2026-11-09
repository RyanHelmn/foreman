---
id: tw-tokens-not-arbitrary
title: Use theme tokens instead of arbitrary values
impact: MEDIUM
impactDescription: "colours and spacing drift from the design system, and dark mode or a rebrand misses them"
roles: [implementer, reviewer]
check: "rg -n '\\b(bg|text|border|ring|fill|stroke)-\\[#|\\b(p|m|gap|w|h)[xytrbl]?-\\[[0-9]' --glob '*.{tsx,jsx,vue,svelte,astro}'"
tags: tailwind, design-tokens
---
Colours, spacing, radii and font sizes come from the theme (`@theme` in v4 CSS, `theme.extend` in a v3 `tailwind.config`). A value the design needs repeatedly becomes a token; arbitrary values (`[#1a73e8]`, `[13px]`) are for one-off layout constraints only. In ShadCN projects use the semantic tokens (`bg-primary`, `text-muted-foreground`), which switch with the theme.

**Incorrect:**

```tsx
<div className="bg-[#0f172a] p-[18px] text-[#94a3b8]">…</div>
```

**Correct:**

```tsx
<div className="bg-card p-4 text-muted-foreground">…</div>
```

Reference: https://tailwindcss.com/docs/theme
