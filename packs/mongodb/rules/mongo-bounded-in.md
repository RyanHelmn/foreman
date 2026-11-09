---
id: mongo-bounded-in
title: Cap the length of arrays from requests used in $in or $nin
impact: MEDIUM
impactDescription: "a request with 100k ids blocks the server and the database on one query"
roles: [implementer, reviewer, security]
tags: mongodb, performance
---
Source: an id list in a request body or query. Sink: `$in`, `$nin`, `$all`. Bound the list in the boundary schema and paginate or batch beyond it.

**Incorrect:**

```ts
const { ids } = req.body
await Product.find({ _id: { $in: ids } })
```

**Correct:**

```ts
const { ids } = z.object({ ids: z.array(objectId).max(100) }).parse(req.body)
await Product.find({ _id: { $in: ids }, orgId: session.orgId })
```
