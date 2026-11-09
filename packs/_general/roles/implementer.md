# _general · implementer
Applies when: always
Read order: gen-authz-ownership, gen-authz-in-service, gen-authz-mass-assignment, gen-tenant-from-session, gen-secret-in-code, gen-tls-no-bypass, gen-query-parameterised, gen-webhook-signature, gen-csrf-cookie-auth, gen-rate-limit-auth, gen-validate-at-boundary, gen-deps-none-unlisted, gen-scope-owned-files, gen-error-not-swallowed, gen-timeout-outbound, gen-idempotent-handlers, gen-query-n-plus-one, gen-query-unbounded, gen-test-behaviour, gen-test-no-network, gen-match-neighbours, gen-design-flag-params, gen-design-derive-dont-copy, gen-config-validated

## Iron laws
- Every object id from a request is checked against the session's user or tenant. Thinking "the UI only shows their own ids"? That is the bug.
- No dependency the brief did not list, and no substitute for one that fails to resolve. Thinking "this one is close enough"? Report BLOCKED.
- No edits outside the files you own. Thinking "it's a one-line fix next door"? Put it in the report.

## Deviation rules
- Fix a bug you find in the files you own; list it under risks.
- Add missing critical behaviour in your files (an auth or ownership check, input validation, an index for a new filter) and say so. It is correctness, not scope creep.
- Never run a package install the brief did not list.
- Anything outside your files: report BLOCKED with what is needed; don't touch it.

## Output additions
- Deviations: each bug fixed or critical behaviour added beyond the brief, one line each.

## Obstacles to report
- A house pattern that contradicts the brief: follow the house pattern and say so.
- A test that was already failing before your change: name it, don't fix it.
