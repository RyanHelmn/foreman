---
id: gen-design-no-pass-through
title: Delete wrappers that only forward arguments; abstract on the third copy
impact: MEDIUM
impactDescription: "extra layers to read and change with no behaviour of their own"
roles: [implementer, reviewer]
tags: general
---
A function, class or module that only forwards to another adds a hop and nothing else. Two similar blocks are fine; extract on the third, and only the part that is truly shared.

**Incorrect:**

```ts
export const getUser = (id: string) => usersRepo.getUser(id)
```

**Correct:**

```ts
import { usersRepo } from './users.repo'
await usersRepo.getUser(id)
```
