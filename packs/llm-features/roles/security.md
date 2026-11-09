# llm-features · security
Applies when: an LLM provider SDK, AI framework or vector database client is a dependency
Read order: llm-output-no-exec, llm-tool-authz, llm-injection-untrusted-context, llm-retrieval-tenant-filter, llm-key-server-only, llm-output-no-raw-html, llm-output-no-auto-urls, llm-cost-per-user

## Also trace (no rule file yet)
- Every path by which non-user text (uploads, URLs fetched by a tool, emails, retrieved chunks, other users' messages) enters a prompt, and which tools are live in that run.
- Tools that fetch URLs: the URL is model-chosen, so it needs the SSRF allowlist (gen-ssrf-allowlist).
- Secrets, other tenants' data or internal URLs in system prompts: assume the prompt is extractable.
- Vector DB API keys and admin endpoints server-side only; ingestion jobs tag chunks with tenant ids.
- Logged prompts and completions: they contain user PII.

## Commands
- Run `npm audit --omit=dev` or `pip-audit` when a manifest changed.
