---
id: llm-structured-output-validated
title: Parse structured model output with a schema before using it
impact: HIGH
impactDescription: "a missing field or wrong enum from the model writes corrupt rows or crashes the handler"
roles: [implementer, reviewer]
check: "rg -n 'JSON.parse\\(.*(text|content|completion)' --glob '!node_modules'"
tags: llm, validation
---
JSON mode and tool schemas make valid output likely, not certain. Validate with the project's schema library (zod `safeParse`, or the AI SDK's schema-checked output) and handle the failure path explicitly: retry once or return an error, never a cast.

**Incorrect:**

```ts
const data = JSON.parse(completion.choices[0].message.content!) as Invoice
await db.invoice.create({ data })
```

**Correct:**

```ts
const parsed = InvoiceSchema.safeParse(JSON.parse(completion.choices[0].message.content ?? 'null'))
if (!parsed.success) throw new ExtractionFailed(parsed.error)
await db.invoice.create({ data: { ...parsed.data, orgId: session.orgId } })
```
