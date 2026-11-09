---
id: mongo-operator-injection
title: Never pass request objects into a query filter unchecked
impact: CRITICAL
impactDescription: "a body of { \"password\": { \"$ne\": null } } logs in as any user or matches every document"
roles: [implementer, reviewer, security]
check: "rg -n -e 'find(One)?\\(\\{[^}]*req\\.(body|query)' -e 'find(One)?\\(req\\.(body|query)' --glob '!node_modules'"
tags: mongodb, injection
---
Source: `req.body` or `req.query` fields, which JSON and query-string parsers turn into objects. Sink: a filter in `find`, `findOne`, `updateMany`, `deleteMany`. Parse each field to a primitive with the boundary schema first. With Mongoose, also set `mongoose.set('sanitizeFilter', true)`, which wraps operator objects in `$eq`.

**Incorrect:**

```ts
const user = await User.findOne({ email: req.body.email, resetToken: req.body.token })
```

**Correct:**

```ts
const { email, token } = z.object({ email: z.string().email(), token: z.string() }).parse(req.body)
const user = await User.findOne({ email, resetToken: token })
```

Reference: https://mongoosejs.com/docs/api/mongoose.html#Mongoose.prototype.sanitizeFilter()
