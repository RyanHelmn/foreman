---
id: search-no-pii
title: Index only the fields the feature searches or displays
impact: HIGH
impactDescription: "emails, phone numbers and addresses become readable to anyone with a search key and outlive deletion requests"
roles: [implementer, reviewer, security]
tags: search, privacy
---
Source: the database row passed to the indexer. Sink: a search index, which is usually readable by a client key and is a second copy deletion jobs forget. Map rows to an explicit document shape; never index whole records. Include personal data only when the feature searches it, and delete from the index wherever the row is deleted.

**Incorrect:**

```ts
await index.addDocuments(users)
```

**Correct:**

```ts
await index.addDocuments(users.map((u) => ({ id: u.id, orgId: u.orgId, name: u.displayName })))
```
