# better-auth · implementer
Applies when: `better-auth` is a dependency
Read order: bauth-server-session-check, bauth-no-hand-rolled, bauth-trusted-origins, bauth-csrf-check-on, bauth-cookie-flags, bauth-verify-before-privileged, bauth-account-linking-verified, bauth-revoke-on-password-change, bauth-rate-limit-storage, bauth-secret-config

## Iron laws
- Every protected server action, route handler and API endpoint calls `auth.api.getSession` itself. Thinking "middleware already checked the cookie"? That is the bug.
- Never set `disableCSRFCheck` or add `*` to `trustedOrigins` to make an origin error go away. Thinking "it's only until the domain is sorted"? Add the exact origin.

## Deviation rules
- Adding or enabling a plugin changes the schema: regenerate it (`npx @better-auth/cli generate`, then the project's migration command) in the same unit, or report BLOCKED if the schema file is not yours.
- Role and permission checks live in the service function that does the work, not only in middleware or the page.

## Output additions
- Auth config changed: options touched, plugins added, schema regenerated yes/no.

## Obstacles to report
- An "invalid origin" 403 from a separate frontend: the origin is missing from `trustedOrigins` for that environment.
- Rate limits do not apply in development, so a local test never trips them.
