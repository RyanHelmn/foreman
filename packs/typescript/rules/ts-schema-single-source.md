---
id: ts-schema-single-source
title: Derive the type from the schema and share one schema between client and server
impact: MEDIUM
impactDescription: "the interface and the validator drift; the server accepts what the type says is impossible"
roles: [implementer, reviewer]
tags: typescript, validation
---
Declare the shape once as a schema and infer the type from it (`z.infer`, `v.InferOutput`). When the client and server both handle a payload and share a package or folder, both import the same schema rather than each declaring their own.

**Incorrect:**

```ts
export interface CreateInvoice { customerId: string; amount: number }
export const CreateInvoiceSchema = z.object({ customerId: z.string(), amount: z.number(), currency: z.string() })
```

**Correct:**

```ts
export const CreateInvoice = z.object({ customerId: z.string(), amount: z.number().int().positive(), currency: z.string().length(3) })
export type CreateInvoice = z.infer<typeof CreateInvoice>
```
