---
id: llm-output-no-raw-html
title: Render model output as text or sanitised markdown, never raw HTML
impact: CRITICAL
impactDescription: "injected text in a document or chat turns into stored XSS in every viewer's session"
roles: [implementer, reviewer, security]
check: "rg -n -e 'dangerouslySetInnerHTML' -e 'rehype-raw' -e 'innerHTML\\s*=' --glob '!node_modules'"
tags: llm, xss
---
Source: a model completion, which carries whatever user or retrieved content was in the prompt. Sink: `dangerouslySetInnerHTML`, `innerHTML`, `v-html`, a markdown renderer with raw HTML on. Render through a markdown component with raw HTML off; if `rehype-raw` is needed, follow it with `rehype-sanitize`.

**Incorrect:**

```tsx
<div dangerouslySetInnerHTML={{ __html: marked(message.content) }} />
```

**Correct:**

```tsx
<ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
```

Reference: https://github.com/remarkjs/react-markdown#security
