# llm-features · reviewer
Applies when: an LLM provider SDK, AI framework or vector database client is a dependency
Read order: llm-output-no-exec, llm-tool-authz, llm-injection-untrusted-context, llm-retrieval-tenant-filter, llm-key-server-only, llm-output-no-raw-html, llm-output-no-auto-urls, llm-cost-per-user, llm-provider-timeout, llm-structured-output-validated

## Blocker vs should-fix
- Blocker: any CRITICAL rule here; a new AI endpoint without a session check or token cap.
- Should-fix: no per-user quota on an internal-only feature; structured output used without a schema on a read-only path.

## Obstacles to report
- Prompt changes without an eval or fixture showing the new behaviour: list under Notes; tests with a mocked model don't cover them.
