---
id: net-deser-typename
title: No BinaryFormatter, and no Newtonsoft TypeNameHandling other than None on input
impact: CRITICAL
impactDescription: "remote code execution: the payload names a .NET type to instantiate"
roles: [implementer, reviewer, security]
check: "rg -n 'BinaryFormatter|NetDataContractSerializer|SoapFormatter|LosFormatter|TypeNameHandling\\.(All|Auto|Objects|Arrays)' --type cs"
tags: deserialisation
---
Source: request bodies, cookies, queue messages, files. Sink: `BinaryFormatter`, `SoapFormatter`, `NetDataContractSerializer`, `LosFormatter`, or Json.NET with `TypeNameHandling` set to anything but `None`. `BinaryFormatter` throws at runtime from .NET 9; don't re-enable it via the compatibility package. Deserialise into concrete DTOs with `System.Text.Json`; for polymorphism use `[JsonDerivedType]` with explicit discriminators.

**Incorrect:**

```csharp
var settings = new JsonSerializerSettings { TypeNameHandling = TypeNameHandling.Auto };
var cmd = JsonConvert.DeserializeObject<Command>(body, settings);
```

**Correct:**

```csharp
var cmd = JsonSerializer.Deserialize<CreateOrderCommand>(body);
```

Reference: https://learn.microsoft.com/dotnet/standard/serialization/binaryformatter-security-guide
