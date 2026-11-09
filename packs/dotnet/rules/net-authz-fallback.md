---
id: net-authz-fallback
title: Set a FallbackPolicy that requires authentication and mark public endpoints [AllowAnonymous]
impact: CRITICAL
impactDescription: "every endpoint without its own [Authorize] is reachable without a session"
roles: [implementer, reviewer, security]
check: "rg -n 'FallbackPolicy|AllowAnonymous' --type cs"
tags: auth, aspnetcore
---
Without a fallback policy, an endpoint is public unless someone remembers `[Authorize]` or `.RequireAuthorization()`. Set `FallbackPolicy` to require an authenticated user so new controllers and minimal API endpoints are protected by default, and opt out with `[AllowAnonymous]` / `.AllowAnonymous()`. Object-level checks still run in the handler (`IAuthorizationService.AuthorizeAsync(User, resource, policy)` or a user-scoped query).

**Incorrect:**

```csharp
builder.Services.AddAuthorization();
app.MapGet("/invoices/{id}", GetInvoice);
```

**Correct:**

```csharp
builder.Services.AddAuthorization(o =>
    o.FallbackPolicy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build());
app.MapGet("/health", () => "ok").AllowAnonymous();
```

Reference: https://learn.microsoft.com/aspnet/core/security/authorization/secure-data#require-authenticated-users
