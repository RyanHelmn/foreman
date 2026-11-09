# better-auth · reviewer
Applies when: `better-auth` is a dependency
Read order: bauth-server-session-check, bauth-no-hand-rolled, bauth-trusted-origins, bauth-csrf-check-on, bauth-cookie-flags, bauth-verify-before-privileged, bauth-account-linking-verified, bauth-revoke-on-password-change, bauth-rate-limit-storage, bauth-secret-config

## Blocker vs should-fix
- Blocker: a protected handler with no server-side `getSession`; any edit to `trustedOrigins`, `disableCSRFCheck`, cookie attributes or `accountLinking` that widens access; a hand-rolled token or session decode.
- Blocker: a plugin added without the matching schema change in the diff.
- Should-fix: in-memory rate limiting on a serverless or multi-instance deploy; password change without session revocation.

## Obstacles to report
- A role check only in middleware or a layout: the service function behind it is still callable directly.
