# tailwind · reviewer
Applies when: `tailwindcss` is a dependency or a `tailwind.config.*` exists
Read order: tw-no-dynamic-classnames, tw-focus-visible-contrast, tw-tokens-not-arbitrary, tw-cva-variants

## Blocker vs should-fix
- Blocker: an interpolated class name in shipped UI; `outline-none` on an interactive element with no `focus-visible` replacement.
- Should-fix: arbitrary colour or spacing values where a token exists; variant logic in template strings when `cva`/`tailwind-variants` is installed; `className` concatenated without `cn()`.
- Nit: class order, when `prettier-plugin-tailwindcss` is not installed to settle it.
