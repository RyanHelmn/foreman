---
id: llm-tool-authz
title: Authorise every tool call as the requesting user and gate destructive tools
impact: CRITICAL
impactDescription: "a prompt makes the model read or delete another user's records through a service-account tool"
roles: [implementer, reviewer, security]
tags: llm, tools, auth
---
Source: tool names and arguments chosen by the model. Sink: the function the tool runs. Offer only the tools the user's role allows, validate arguments with the tool's schema, scope every query to the session user or tenant inside the tool, and require explicit user confirmation for writes that send, pay, delete or share.

**Incorrect:**

```ts
tools: {
  deleteInvoice: tool({ inputSchema: z.object({ id: z.string() }), execute: ({ id }) => db.invoice.delete({ where: { id } }) }),
}
```

**Correct:**

```ts
tools: {
  deleteInvoice: tool({
    inputSchema: z.object({ id: z.string() }),
    execute: ({ id }) => requestConfirmation(session.userId, 'deleteInvoice', { id, orgId: session.orgId }),
  }),
}
```
