---
id: net-ef-include
title: Load navigations a list needs with Include or a Select projection
impact: HIGH
impactDescription: "one query per row with lazy loading, or null navigations without it"
roles: [implementer, reviewer]
check: "rg -n 'UseLazyLoadingProxies' --type cs"
tags: efcore, n+1
---
EF Core does not load navigation properties unless asked. With lazy-loading proxies each access is a query; without them the navigation is silently null. Use `Include`/`ThenInclude`, or project to a DTO with `Select`, which loads only the columns used. Add `AsSplitQuery()` when including more than one collection.

**Incorrect:**

```csharp
var orders = await db.Orders.Where(o => o.Status == status).ToListAsync();
return orders.Select(o => new OrderDto(o.Id, o.Customer.Name));
```

**Correct:**

```csharp
return await db.Orders.Where(o => o.Status == status)
    .Select(o => new OrderDto(o.Id, o.Customer.Name))
    .ToListAsync();
```

Reference: https://learn.microsoft.com/ef/core/querying/related-data/eager
