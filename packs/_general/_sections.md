# _general sections

1. Access and secrets (gen-authz-*, gen-secret-*, gen-tenant-*, gen-csrf-*, gen-rate-limit-*) · CRITICAL
2. Untrusted input (gen-validate-*, gen-query-*, gen-ssrf-*, gen-webhook-*) · CRITICAL
3. Failure handling (gen-error-*, gen-timeout-*, gen-idempotent-*) · HIGH
4. Scope and dependencies (gen-scope-*, gen-deps-*) · HIGH
5. Data access (gen-query-n-plus-one, gen-query-unbounded) · HIGH
6. Tests (gen-test-*) · HIGH
7. Design and consistency (gen-design-*, gen-match-*) · MEDIUM
8. Config and logging (gen-config-*, gen-log-*) · MEDIUM
