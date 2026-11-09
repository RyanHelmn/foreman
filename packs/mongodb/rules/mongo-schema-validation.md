---
id: mongo-schema-validation
title: Give every collection a schema: a Mongoose model or a $jsonSchema validator
impact: MEDIUM
impactDescription: "a typo or partial write stores malformed documents that break every later reader"
roles: [implementer, reviewer]
tags: mongodb, schema
---
A collection written with the raw driver accepts any shape. When adding one, create it with a `$jsonSchema` validator (or `collMod` an existing one), or write through a Mongoose model with `strict` left on.

**Incorrect:**

```ts
await db.collection('invoices').insertOne(req.body)
```

**Correct:**

```ts
await db.createCollection('invoices', {
  validator: { $jsonSchema: { bsonType: 'object', required: ['orgId', 'total'], properties: { total: { bsonType: 'decimal' } } } },
})
```

Reference: https://www.mongodb.com/docs/manual/core/schema-validation/
