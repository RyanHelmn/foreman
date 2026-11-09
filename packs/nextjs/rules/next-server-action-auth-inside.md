---
id: next-server-action-auth-inside
title: Validate input and check the session inside every Server Action
impact: CRITICAL
impactDescription: "anyone can POST to the action with any arguments, signed in or not"
roles: [implementer, reviewer, security]
check: "rg -l \"^['\\\"]use server['\\\"]\" app src"
tags: auth, nextjs, server-actions
---
Source: the arguments of a `"use server"` function, sent by the client. Sink: the database write or side effect inside. A Server Action is a public POST endpoint; the page that renders the form being protected does not protect the action. Parse the arguments with a schema, read the session, and check ownership in the action body itself (or in a wrapper every action uses).

**Incorrect:**

```ts
'use server'
export async function deleteProject(id: string) {
  await db.project.delete({ where: { id } })
  revalidatePath('/projects')
}
```

**Correct:**

```ts
'use server'
export async function deleteProject(input: unknown) {
  const { id } = DeleteProject.parse(input)
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  await db.project.delete({ where: { id, ownerId: session.user.id } })
  revalidatePath('/projects')
}
```

Reference: https://nextjs.org/docs/app/guides/data-security
