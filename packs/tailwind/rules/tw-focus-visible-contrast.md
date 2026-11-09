---
id: tw-focus-visible-contrast
title: Replace a removed outline with a visible focus-visible style
impact: HIGH
impactDescription: "keyboard users cannot see which control has focus"
roles: [implementer, reviewer]
check: "rg -n 'outline-none' --glob '*.{tsx,jsx,vue,svelte,astro,html}'"
tags: tailwind, accessibility
---
`outline-none` (or `outline-hidden` in v4) on an interactive element needs a `focus-visible:` ring or outline in the same class list. Use `focus-visible:` rather than `focus:` so mouse clicks don't show the ring. Text and icon colours against their background meet WCAG AA (4.5:1 for body text, 3:1 for large text and focus indicators); pick from the project's token pairs rather than lightening a grey until it looks subtle.

**Incorrect:**

```tsx
<button className="rounded-md bg-primary px-3 py-2 text-gray-300 outline-none">Save</button>
```

**Correct:**

```tsx
<button className="rounded-md bg-primary px-3 py-2 text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Save
</button>
```

Reference: https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html
