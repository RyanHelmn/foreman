---
id: net-validate-model
title: Reject invalid models before the handler runs: [ApiController], ModelState check, or explicit validator
impact: HIGH
impactDescription: "DataAnnotations on the DTO are never enforced and invalid data reaches the database"
roles: [implementer, reviewer, security]
tags: validation, aspnetcore
---
`[ApiController]` returns 400 automatically for invalid models. MVC controllers without it must check `ModelState.IsValid`. Minimal API endpoints do not run DataAnnotations unless the project registers validation (`builder.Services.AddValidation()` on .NET 10+, or an endpoint filter / FluentValidation call); validate explicitly in the handler otherwise.

**Incorrect:**

```csharp
public class OrdersController : Controller
{
    [HttpPost]
    public async Task<IActionResult> Create(CreateOrder dto) { await _orders.Add(dto); return Ok(); }
}
```

**Correct:**

```csharp
[HttpPost]
public async Task<IActionResult> Create(CreateOrder dto)
{
    if (!ModelState.IsValid) return ValidationProblem(ModelState);
    await _orders.Add(dto);
    return Ok();
}
```

Reference: https://learn.microsoft.com/aspnet/core/mvc/models/validation
