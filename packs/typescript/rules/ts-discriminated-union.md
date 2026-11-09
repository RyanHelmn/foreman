---
id: ts-discriminated-union
title: Model states as a discriminated union with an exhaustive switch, not optional fields and boolean flags
impact: MEDIUM
impactDescription: "impossible states (loading and error both set) compile, and a new state is silently unhandled"
roles: [implementer, reviewer]
tags: typescript, design
---
When a value has distinct states, give each a literal `kind`/`status` tag with only the fields valid in that state. Switch on the tag and end with a `never` check so adding a state breaks the build at every unhandled site.

**Incorrect:**

```ts
type Payment = { isPaid: boolean; isFailed: boolean; paidAt?: Date; error?: string }
```

**Correct:**

```ts
type Payment =
  | { status: 'pending' }
  | { status: 'paid'; paidAt: Date }
  | { status: 'failed'; error: string }

switch (p.status) {
  case 'pending': return '…'
  case 'paid': return p.paidAt.toISOString()
  case 'failed': return p.error
  default: { const _exhaustive: never = p; return _exhaustive }
}
```
