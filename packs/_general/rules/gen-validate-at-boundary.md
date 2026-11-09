---
id: gen-validate-at-boundary
title: Validate every input at the boundary with a schema
impact: HIGH
impactDescription: "malformed input reaches business logic and fails deep inside it, or worse, succeeds"
roles: [implementer, reviewer, security]
tags: general
---
Boundaries are HTTP handlers, queue consumers, CLI arguments, files and third-party responses. Parse once with a schema at the edge; inside, trust the types.

**Incorrect (trusts the shape of a webhook payload):**

```ts
const amount = req.body.data.object.amount / 100
```

**Correct:**

```ts
const event = PaymentEvent.parse(req.body)
const amount = event.data.object.amount / 100
```
