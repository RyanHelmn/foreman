# _general · reviewer
Applies when: always
Read order: gen-authz-ownership, gen-authz-in-service, gen-authz-mass-assignment, gen-tenant-from-session, gen-secret-in-code, gen-tls-no-bypass, gen-query-parameterised, gen-webhook-signature, gen-csrf-cookie-auth, gen-rate-limit-auth, gen-validate-at-boundary, gen-deps-none-unlisted, gen-scope-owned-files, gen-error-not-swallowed, gen-timeout-outbound, gen-idempotent-handlers, gen-query-n-plus-one, gen-query-unbounded, gen-test-behaviour, gen-test-no-network, gen-match-neighbours, gen-design-flag-params, gen-design-derive-dont-copy, gen-design-no-pass-through, gen-config-validated, gen-log-no-pii

Cite the rule id in every finding it covers: `path:line — [category] (rule-id) issue → fix`.

## Blocker vs should-fix
- Blocker: any CRITICAL rule broken; a HIGH rule broken on a path that handles money, auth or personal data; a requirement not met.
- Should-fix: other HIGH rules; MEDIUM rules where the diff adds a second way to do something.
- Nit: MEDIUM rules on code the diff only touches in passing.

## Obstacles to report
- A finding that needs a decision the requirements don't settle: list it under Notes, not as a blocker.
