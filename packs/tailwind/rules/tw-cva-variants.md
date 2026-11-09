---
id: tw-cva-variants
title: Express component variants with cva or tailwind-variants and merge with cn()
impact: MEDIUM
impactDescription: "conflicting classes win by stylesheet order, so a caller's className override silently does nothing"
roles: [implementer, reviewer]
tags: tailwind, components
---
When the project has `class-variance-authority` or `tailwind-variants`, a component with variants declares them there, and merges the caller's `className` last through the project's `cn()` (`clsx` + `tailwind-merge`). Template strings and ternaries leave both `px-4` and `px-2` in the list; which applies depends on CSS order, not on what was passed.

**Incorrect:**

```tsx
<button className={`px-4 py-2 ${size === 'sm' ? 'px-2 py-1' : ''} ${className}`} />
```

**Correct:**

```tsx
const button = cva('inline-flex items-center rounded-md', {
  variants: { size: { sm: 'px-2 py-1 text-sm', md: 'px-4 py-2' } },
  defaultVariants: { size: 'md' },
})

<button className={cn(button({ size }), className)} />
```

Reference: https://cva.style/docs
