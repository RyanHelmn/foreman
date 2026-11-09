# nextjs · implementer
Applies when: `next` is a dependency
Read order: next-server-action-auth-inside, next-route-handler-auth, next-middleware-not-auth-boundary, next-public-env-only, next-no-user-data-public-cache, next-client-props-serialised, next-remote-patterns, next-revalidate-after-mutation, next-server-component-default, next-cache-mode-explicit, next-loading-error-per-segment, next-image-font-metadata

## Iron laws
- Every Server Action and route handler method reads the session and validates its input in its own body. Thinking "middleware already protects this path"? That is the bug.
- No secret behind `NEXT_PUBLIC_`, and no per-user data in a shared cache. Thinking "it's only cached for a minute"? That is the bug.

## Deviation rules
- Check the installed `next` version before using version-specific APIs: async `params`/`cookies()`/`headers()` (15+), `proxy.ts` and `'use cache'` (16). Follow what the codebase already uses.
- Data fetching in Server Components; client components fetch only through the project's query library for client-driven data.
- App Router and Pages Router coexist in some projects: add new routes to whichever the neighbouring feature uses.

## Output additions
- Server Actions and route handlers added or changed: each with its auth check, one line each.
- Cache behaviour of new reads: no-store, revalidate n, or tag.

## Obstacles to report
- `next build` failing on a page you didn't touch because of static generation: report the page and error; don't add `dynamic = 'force-dynamic'` to silence it.
