---
id: next-revalidate-after-mutation
title: Revalidate the affected path or tag after every mutation
impact: HIGH
impactDescription: "the user saves, and the page keeps showing the old data until the cache expires"
roles: [implementer, reviewer]
tags: nextjs, caching, server-actions
---
A Server Action or route handler that writes data must invalidate what renders it: `revalidatePath` for the page, or the tag the read was cached under. Calling `router.refresh()` on the client refreshes only that user's view and leaves the shared cache stale.

**Incorrect:**

```ts
'use server'
export async function renameProject(input: unknown) {
  const { id, name } = RenameProject.parse(input)
  const user = await requireUser()
  await db.project.update({ where: { id, ownerId: user.id }, data: { name } })
}
```

**Correct:**

```ts
  await db.project.update({ where: { id, ownerId: user.id }, data: { name } })
  revalidatePath(`/projects/${id}`)
```

Reference: https://nextjs.org/docs/app/api-reference/functions/revalidatePath
