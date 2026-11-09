---
id: net-ef-no-tracking
title: Query read-only entities with AsNoTracking
impact: MEDIUM
impactDescription: "every read pays change-tracking memory and CPU, and a stray SaveChanges writes it back"
roles: [implementer, reviewer]
tags: efcore, performance
---
Queries that return entities only to read or serialise them should use `AsNoTracking()` (or the context sets `QueryTrackingBehavior.NoTracking` and writes opt in with `AsTracking()`). Projections with `Select` to a DTO are not tracked and need neither.

**Incorrect:**

```csharp
var products = await db.Products.Where(p => p.Active).ToListAsync();
return Ok(products);
```

**Correct:**

```csharp
var products = await db.Products.AsNoTracking().Where(p => p.Active).ToListAsync();
return Ok(products);
```

Reference: https://learn.microsoft.com/ef/core/querying/tracking
