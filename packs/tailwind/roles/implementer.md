# tailwind · implementer
Applies when: `tailwindcss` is a dependency or a `tailwind.config.*` exists
Read order: tw-no-dynamic-classnames, tw-focus-visible-contrast, tw-tokens-not-arbitrary, tw-cva-variants

## Deviation rules
- Check the major version first: v4 configures the theme in CSS (`@import "tailwindcss"`, `@theme`), v3 in `tailwind.config.*`. Add tokens where the existing ones live.
- Use the project's existing UI primitives (`components/ui/*` in ShadCN projects) before writing a styled element from scratch; don't edit generated ShadCN files beyond the brief.
- No `@apply` for component styles in a codebase that composes classes in markup; follow what neighbouring files do.

## Obstacles to report
- A class that should exist but has no effect: a dynamic class, or a file outside the scanned sources (v3 `content` globs, v4 `@source` for classes in packages under `node_modules`).
