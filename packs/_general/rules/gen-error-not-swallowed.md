---
id: gen-error-not-swallowed
title: Never swallow an error; fail with context
impact: HIGH
impactDescription: "failures disappear and surface later as wrong data"
roles: [implementer, reviewer]
tags: general
---
Catch only to add context, translate to the layer's error type, or recover deliberately. One error strategy per layer. Stack traces and internal messages never reach the user.

**Incorrect:**

```ts
try { await sendInvoice(id) } catch {}
```

**Correct:**

```ts
try { await sendInvoice(id) } catch (err) {
  throw new InvoiceSendError(id, { cause: err })
}
```
