---
id: llm-provider-timeout
title: Set an explicit timeout and maxRetries on provider clients
impact: HIGH
impactDescription: "a stalled completion holds the request for minutes and exhausts serverless concurrency"
roles: [implementer, reviewer]
check: "rg -n -e 'new (OpenAI|Anthropic)\\(' --glob '!node_modules'"
tags: llm, reliability
---
The official SDKs default to timeouts measured in minutes and retry on their own. Set `timeout` and `maxRetries` on the client (or an `abortSignal` per call in the AI SDK) to fit the route's own limit, and stream long answers instead of raising the timeout.

**Incorrect:**

```ts
const anthropic = new Anthropic()
```

**Correct:**

```ts
const anthropic = new Anthropic({ timeout: 30_000, maxRetries: 2 })
```
