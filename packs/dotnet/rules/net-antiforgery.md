---
id: net-antiforgery
title: Validate anti-forgery tokens on cookie-authenticated form posts
impact: HIGH
impactDescription: "another site submits state-changing requests with the victim's auth cookie"
roles: [implementer, reviewer, security]
check: "rg -n 'IgnoreAntiforgeryToken|DisableAntiforgery' --type cs"
tags: csrf, aspnetcore
---
With cookie authentication, every unsafe-method endpoint must validate an anti-forgery token. Razor Pages do it by default. MVC needs `AutoValidateAntiforgeryTokenAttribute` as a global filter (or `[ValidateAntiForgeryToken]`). Minimal API form endpoints need `app.UseAntiforgery()` (.NET 8+). `[IgnoreAntiforgeryToken]` / `.DisableAntiforgery()` belongs only on bearer-token or signature-verified endpoints.

**Incorrect:**

```csharp
builder.Services.AddControllersWithViews();
```

**Correct:**

```csharp
builder.Services.AddControllersWithViews(o =>
    o.Filters.Add(new AutoValidateAntiforgeryTokenAttribute()));
```

Reference: https://learn.microsoft.com/aspnet/core/security/anti-request-forgery
