---
id: tw-no-dynamic-classnames
title: Write every class name in full; never build one by interpolation
impact: HIGH
impactDescription: "the class is missing from the production CSS and the element renders unstyled"
roles: [implementer, reviewer]
check: "rg -n '\\b[a-z]+(-[a-z]+)*-\\$\\{' --glob '*.{ts,tsx,js,jsx,vue,svelte,astro}'"
tags: tailwind
---
Tailwind generates CSS by scanning source files for complete class strings. `bg-${color}-500` is never seen, so it works only while some other file happens to use the same class. Map each value to a full class name in a lookup object, or use a CSS variable for truly dynamic values (`style={{ '--w': pct + '%' }}` with `w-(--w)` in v4 or `w-[var(--w)]` in v3).

**Incorrect:**

```tsx
<span className={`bg-${tone}-100 text-${tone}-800`}>{label}</span>
```

**Correct:**

```tsx
const toneClass = {
  success: 'bg-green-100 text-green-800',
  danger: 'bg-red-100 text-red-800',
} as const

<span className={toneClass[tone]}>{label}</span>
```

Reference: https://tailwindcss.com/docs/detecting-classes-in-source-files#dynamic-class-names
