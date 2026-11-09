---
id: llm-cost-per-user
title: Cap output tokens and check a per-user budget before every model call
impact: HIGH
impactDescription: "one user or script loops the endpoint and spends the month's budget in an hour"
roles: [implementer, reviewer, security]
tags: llm, cost
---
Every call sets an output token limit (`max_tokens` in the provider SDKs, `maxOutputTokens` in AI SDK 5, `maxTokens` in AI SDK 4) and bounds input size (messages kept, document length). Before calling, check the user's or tenant's usage against a quota; after, record the tokens the response reports. Agent loops also cap the number of steps.

**Incorrect:**

```ts
export async function POST(req: Request) {
  const { messages } = await req.json()
  return streamText({ model, messages }).toTextStreamResponse()
}
```

**Correct:**

```ts
export async function POST(req: Request) {
  const session = await requireSession(req)
  await assertWithinQuota(session.orgId)
  const { messages } = ChatInput.parse(await req.json())
  const result = streamText({ model, messages: messages.slice(-20), maxOutputTokens: 1024, onFinish: ({ usage }) => recordUsage(session.orgId, usage) })
  return result.toTextStreamResponse()
}
```
