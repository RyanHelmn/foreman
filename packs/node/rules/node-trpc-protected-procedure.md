---
id: node-trpc-protected-procedure
title: Build tRPC procedures that touch user data on protectedProcedure, with auth from context
impact: CRITICAL
impactDescription: "a publicProcedure mutation is callable by anyone who can reach /trpc"
roles: [implementer, reviewer, security]
check: "rg -n 'publicProcedure' -A3 | rg -n 'mutation|ctx\\.db'"
tags: node, trpc, auth
---
`createContext` resolves the session from the request; a `protectedProcedure` middleware throws `TRPCError({ code: 'UNAUTHORIZED' })` when it is absent and narrows `ctx.user`. Every procedure reading or writing user data starts from it, and still checks ownership of the ids in its input. Routers are split per domain and merged in one `appRouter`.

**Incorrect:**

```ts
deleteProject: publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ ctx, input }) => ctx.db.project.delete({ where: { id: input.id } })),
```

**Correct:**

```ts
deleteProject: protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ ctx, input }) =>
    ctx.db.project.delete({ where: { id: input.id, ownerId: ctx.user.id } })),
```
