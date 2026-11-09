# better-auth · security
Applies when: `better-auth` is a dependency
Read order: bauth-server-session-check, bauth-no-hand-rolled, bauth-trusted-origins, bauth-csrf-check-on, bauth-cookie-flags, bauth-account-linking-verified, bauth-verify-before-privileged, bauth-revoke-on-password-change, bauth-rate-limit-storage, bauth-secret-config

## Also trace (no rule file yet)
- Admin plugin impersonation: who may call `impersonateUser`, and whether impersonated sessions (`impersonatedBy`) are logged with the acting admin's id.
- `callbackURL`/`redirectTo` values built from request input reaching a redirect outside `trustedOrigins`.
- Organization plugin: active organisation id from the session, never from the request body.
- `databaseHooks` that return user or session rows to the client with token fields.

## Commands
- Run `npm audit --omit=dev` (or the lockfile's package manager equivalent) when `better-auth` or a plugin version changed.
