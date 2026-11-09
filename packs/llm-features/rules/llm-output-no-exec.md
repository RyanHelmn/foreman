---
id: llm-output-no-exec
title: Never execute model output as code, shell, SQL or a query filter
impact: CRITICAL
impactDescription: "a prompt-injected document runs arbitrary code or SQL with the server's privileges"
roles: [implementer, reviewer, security]
check: "rg -n -e 'eval\\(' -e 'new Function\\(' -e 'exec\\(' -e '\\$queryRawUnsafe' --glob '!node_modules'"
tags: llm, injection
---
Source: any model completion or tool-call argument. Sink: `eval`, `child_process`, raw SQL, a database filter object, a file path. Treat it like request input: map it to an allowlisted action or parse it into a schema, then use parameterised calls. Generated code runs only in an isolated sandbox with no secrets or network.

**Incorrect:**

```ts
const { text } = await generateText({ model, prompt: `SQL for: ${question}` })
return db.$queryRawUnsafe(text)
```

**Correct:**

```ts
const { output } = await askForReportSpec(question)
const spec = ReportSpec.parse(output)
return db.order.groupBy({ by: [spec.groupBy], where: { orgId: session.orgId } })
```
