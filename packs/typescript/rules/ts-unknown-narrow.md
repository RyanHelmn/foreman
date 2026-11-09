---
id: ts-unknown-narrow
title: Narrow unknown with a schema or type guard, never with an as-cast
impact: HIGH
impactDescription: "a cast asserts a shape nobody checked; the first unexpected payload crashes deep in business logic"
roles: [implementer, reviewer, security]
check: "rg -n -e 'JSON\\.parse\\([^)]*\\)\\s+as\\s' -e '\\.json\\(\\)\\)?\\s+as\\s' --type ts"
tags: typescript, validation
---
`JSON.parse`, `res.json()`, `catch (err)`, `localStorage`, message payloads and env vars are `unknown` until checked. `as Foo` on them is a lie the compiler believes. Parse with the project's schema library (zod, valibot, class-validator) or narrow with `instanceof` / a type guard.

**Incorrect:**

```ts
const body = (await res.json()) as Customer
try { … } catch (err) { log(err.message) }
```

**Correct:**

```ts
const body = Customer.parse(await res.json())
try { … } catch (err) { log(err instanceof Error ? err.message : String(err)) }
```
