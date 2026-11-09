---
id: jvm-null-no-bang
title: Handle absent values explicitly; no Kotlin !! or bare Optional.get() on data that can be missing
impact: MEDIUM
impactDescription: "a missing row or header becomes a 500 with a NullPointerException instead of a 404 or 400"
roles: [implementer, reviewer]
check: "rg -n '!!|\\.get\\(\\)\\s*[;.)]' --type kotlin --type java"
tags: nullability, kotlin
---
Values from repositories, maps, headers and Java APIs called from Kotlin (platform types) can be absent. `!!` and `Optional.get()` turn that into an unhandled exception. Map absence to the response it deserves at the point it is read.

**Incorrect:**

```kotlin
val user = userRepository.findById(id).get()
val tenant = request.getHeader("X-Tenant")!!
```

**Correct:**

```kotlin
val user = userRepository.findById(id).orElseThrow { NotFoundException("user $id") }
val tenant = request.getHeader("X-Tenant") ?: throw BadRequestException("X-Tenant required")
```
