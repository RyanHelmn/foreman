---
id: gen-design-flag-params
title: Split behaviour-switching flags into explicit functions or variants
impact: MEDIUM
impactDescription: "every caller and test must reason about combinations of modes"
roles: [implementer, reviewer]
tags: general
---
A boolean that switches what a unit does means two units share one body. One flag that toggles a detail is fine; two or more that combine into modes are the smell.

**Incorrect:**

```ts
save(post, { draft: true, notify: false })
```

**Correct:**

```ts
saveDraft(post)
publish(post)
```
