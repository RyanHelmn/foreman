# nextjs · reviewer
Applies when: `next` is a dependency
Read order: next-server-action-auth-inside, next-route-handler-auth, next-middleware-not-auth-boundary, next-public-env-only, next-no-user-data-public-cache, next-client-props-serialised, next-remote-patterns, next-revalidate-after-mutation, next-server-component-default, next-cache-mode-explicit, next-loading-error-per-segment, next-image-font-metadata

## Blocker vs should-fix
- Blocker: a Server Action or route handler without its own session check or input parse; a secret with `NEXT_PUBLIC_`; per-user data in a shared cache; whole records passed to client components when they hold credentials or personal data; `hostname: '**'`.
- Should-fix: a mutation without revalidation; `"use client"` on a page or layout; a fetch with no stated cache mode; a fetching segment without `error.tsx`.
- Nit: raw `<img>`, `<head>` or font `<link>`.

## Obstacles to report
- `typescript.ignoreBuildErrors` or `eslint.ignoreDuringBuilds` in `next.config`: note it, since the build no longer proves types or lint.
