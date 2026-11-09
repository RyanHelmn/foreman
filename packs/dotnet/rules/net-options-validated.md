---
id: net-options-validated
title: Bind settings with AddOptions<T>().ValidateDataAnnotations().ValidateOnStart()
impact: MEDIUM
impactDescription: "a missing setting surfaces as a null on the first request in production instead of a failed start"
roles: [implementer, reviewer]
check: "rg -n 'Configuration\\[\"|GetValue<|Configure<' --type cs"
tags: config, options
---
Read configuration through a typed options class injected as `IOptions<T>`, with `[Required]`/`[Range]` on its properties and validation at startup. Reading `Configuration["Key"]` in services scatters magic strings and returns null when absent. Secrets come from user-secrets locally and a vault or environment in production, never `appsettings.json`.

**Incorrect:**

```csharp
var apiKey = _config["Stripe:SecretKey"];
```

**Correct:**

```csharp
builder.Services.AddOptions<StripeOptions>()
    .Bind(builder.Configuration.GetSection("Stripe"))
    .ValidateDataAnnotations()
    .ValidateOnStart();
```

```csharp
public sealed class StripeOptions { [Required] public string SecretKey { get; init; } = ""; }
```

Reference: https://learn.microsoft.com/aspnet/core/fundamentals/configuration/options
