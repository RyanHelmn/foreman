---
id: gen-log-no-pii
title: Log structured events with a request id and no secrets or personal data
impact: MEDIUM
impactDescription: "tokens and personal data end up in log storage with wide access"
roles: [implementer, reviewer, security]
tags: general
---
Log events as structured fields with a correlation id. Never log passwords, tokens, full card or bank numbers, or whole request bodies.

**Incorrect:**

```ts
logger.info(`login ${JSON.stringify(req.body)}`)
```

**Correct:**

```ts
logger.info({ event: 'login', userId: user.id, requestId: req.id })
```
