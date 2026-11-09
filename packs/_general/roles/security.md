# _general · security
Applies when: always
Read order: gen-authz-ownership, gen-authz-in-service, gen-authz-mass-assignment, gen-tenant-from-session, gen-secret-in-code, gen-tls-no-bypass, gen-query-parameterised, gen-ssrf-allowlist, gen-webhook-signature, gen-csrf-cookie-auth, gen-rate-limit-auth, gen-password-hash, gen-validate-at-boundary, gen-deps-none-unlisted, gen-log-no-pii

Report a finding only with a concrete source → sink path through the changed code; everything else is hardening.

## Also trace (no rule file yet)
- Open redirects from a `next`/`returnTo` parameter; CORS `*` with credentials.
- Untrusted YAML/XML/archives: unsafe loaders, external entities, zip-slip.
- Uploads: size and type limits, private storage, expiring signed URLs.
- Rate limits on expensive and AI endpoints.
- Admin and debug surfaces (API docs, queue dashboards, GraphQL explorers) authenticated or off in production.
- Untrusted text reaching a tool-calling model (prompt injection).

## Commands
- Run the ecosystem's advisory audit when a manifest or lockfile changed (`npm audit --omit=dev`, `pip-audit`, `cargo audit`, `bundle audit`, `govulncheck ./...`, `dotnet list package --vulnerable`).

## Output additions
- New dependencies: name, version, maintainer, install scripts yes/no.
