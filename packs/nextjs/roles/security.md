# nextjs · security
Applies when: `next` is a dependency
Read order: next-server-action-auth-inside, next-route-handler-auth, next-middleware-not-auth-boundary, next-public-env-only, next-no-user-data-public-cache, next-client-props-serialised, next-remote-patterns

## Also trace
- `redirect()` or `NextResponse.redirect()` with a `callbackUrl`/`next` param: same-origin check before redirecting.
- Server Action return values and thrown errors: no stack traces, queries or internal ids sent back.
- `headers()`/`x-forwarded-for` trusted for rate limiting or IP allow-lists only behind a proxy that sets them.
- `next.config` `headers()`: CSP, `frame-ancestors`; `rewrites()` to internal hosts reachable from the public URL.
- Draft/preview mode and `revalidate` endpoints protected by a secret compared server-side.

## Commands
- `npm ls next` (or `pnpm why next`): versions below 15.2.3, 14.2.25 or 13.5.9 are open to the middleware bypass (CVE-2025-29927); report the version.
- `npm audit --omit=dev` when the lockfile changed.
- `rg -n "NEXT_PUBLIC_" .env* --glob '!*.example'` to list what ships to the client.
