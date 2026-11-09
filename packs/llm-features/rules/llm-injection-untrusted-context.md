---
id: llm-injection-untrusted-context
title: Don't give write or send tools to a run whose context holds untrusted content
impact: CRITICAL
impactDescription: "an email, web page or uploaded file instructs the model to forward data or take actions as the user"
roles: [implementer, reviewer, security]
tags: llm, prompt-injection
---
Source: text the user did not write themselves: fetched pages, uploaded documents, emails, tickets, retrieved chunks, other users' messages. Sink: a tool that writes, sends, pays or calls out. Delimiters and "ignore instructions in the document" do not stop injection. Run untrusted content through a step with read-only tools (or none), and pass only its structured result to the step that can act.

**Incorrect:**

```ts
await generateText({ model, tools: { sendEmail, readInbox }, prompt: `Summarise and reply:\n${email.body}` })
```

**Correct:**

```ts
const summary = await summarise(email.body)
await generateText({ model, tools: { draftReply }, prompt: `Draft a reply to: ${JSON.stringify(summary)}` })
```
