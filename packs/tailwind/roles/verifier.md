# tailwind · verifier
Applies when: `tailwindcss` is a dependency or a `tailwind.config.*` exists

## Commands
- Only when `prettier-plugin-tailwindcss` is in the dependencies: `npx prettier --check <changed files>` (class order).
- Only when `eslint-plugin-tailwindcss` is in the dependencies: the project's lint script covers it.

## Obstacles to report
- Missing or interpolated classes pass every test, typecheck and lint; they show only in the built CSS or a screenshot. Say so when the change adds conditional styling.
