# llm-features · implementer
Applies when: an LLM provider SDK, AI framework or vector database client is a dependency
Read order: llm-output-no-exec, llm-tool-authz, llm-injection-untrusted-context, llm-retrieval-tenant-filter, llm-key-server-only, llm-output-no-raw-html, llm-output-no-auto-urls, llm-cost-per-user, llm-provider-timeout, llm-structured-output-validated

## Iron laws
- Model output and tool arguments are untrusted input: never executed, never rendered as HTML, never used unscoped in a query. Thinking "it's our own prompt"? The prompt contains user text. That is the bug.
- Every tool runs with the requesting user's permissions and tenant. Thinking "the model only calls it when appropriate"? The model obeys whatever text is in its context.
- Retrieval is scoped to the tenant inside the vector query. Thinking "I filter the results afterwards"? That is the bug.

## Deviation rules
- Use the model id the brief or project config names; never swap in another model or provider on your own.
- Prompts live where the project already keeps them; don't scatter new inline prompt strings across handlers.

## Output additions
- Model calls added: model id, max output tokens, tools exposed, whether untrusted content reaches the context.

## Obstacles to report
- AI SDK option names changed between major versions (`maxTokens` → `maxOutputTokens`, `parameters` → `inputSchema`); match the installed version.
