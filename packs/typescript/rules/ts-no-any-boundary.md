---
id: ts-no-any-boundary
title: No any in exported signatures; use unknown or a real type
impact: HIGH
impactDescription: "every caller of the function loses type checking, and wrong shapes pass silently"
roles: [implementer, reviewer]
check: "rg -n -e ':\\s*any\\b' -e 'as any\\b' -e '<any>' --type ts"
tags: typescript
---
`any` disables checking in both directions and spreads through every value it touches. Exported functions, module boundaries and shared types use a concrete type, a generic, or `unknown`. `as any` to get past an error is the same as `@ts-ignore`.

**Incorrect:**

```ts
export function handleEvent(payload: any) {
  return db.event.create({ data: payload.data })
}
```

**Correct:**

```ts
export function handleEvent(payload: unknown) {
  const event = EventPayload.parse(payload)
  return db.event.create({ data: event.data })
}
```
