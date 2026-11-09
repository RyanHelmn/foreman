---
id: llm-key-server-only
title: Call model providers from the server; never ship a provider key to the browser
impact: CRITICAL
impactDescription: "anyone copies the key from the bundle and runs up the bill or reads org data"
roles: [implementer, reviewer, security]
check: "rg -n -e 'dangerouslyAllowBrowser' -e 'NEXT_PUBLIC_[A-Z_]*(OPENAI|ANTHROPIC|AI)[A-Z_]*KEY' -e 'VITE_[A-Z_]*(OPENAI|ANTHROPIC)[A-Z_]*KEY' --glob '!node_modules'"
tags: llm, secrets
---
Source: the provider API key. Sink: client JavaScript. `dangerouslyAllowBrowser: true` and public env prefixes put the key in the bundle. Route calls through a server endpoint that checks the session.

**Incorrect:**

```ts
const client = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true })
```

**Correct:**

```ts
const res = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ messages }) })
```
