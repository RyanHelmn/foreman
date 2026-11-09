---
id: ts-strict-no-suppress
title: Keep strict on; never loosen tsconfig or suppress an error to make a diff compile
impact: HIGH
impactDescription: "the type error the compiler found ships as a runtime crash"
roles: [implementer, reviewer]
check: "rg -n -e '@ts-ignore' -e '@ts-nocheck' -e '\"strict\": false' -e '\"noImplicitAny\": false'"
tags: typescript
---
`strict: true` stays on in every tsconfig. A diff that adds `@ts-ignore`, `@ts-nocheck`, a non-null `!` on a value that can genuinely be absent, or flips a compiler flag off is hiding a bug, not fixing one. When a suppression is unavoidable (a wrong third-party type), use `@ts-expect-error` with the reason on the same line, so it fails once the type is fixed.

**Incorrect:**

```ts
// @ts-ignore
const total = order.items.reduce((s, i) => s + i.price, 0)
const user = users.find((u) => u.id === id)!
```

**Correct:**

```ts
const total = order.items.reduce((s, i) => s + i.price, 0)
const user = users.find((u) => u.id === id)
if (!user) throw new NotFoundError('user', id)
```
