---
id: spring-validate-valid
title: Put @Valid on every @RequestBody and @Validated on controllers with constrained parameters
impact: HIGH
impactDescription: "constraint annotations on the DTO are never checked and invalid data reaches the service"
roles: [implementer, reviewer, security]
check: "rg -n '@RequestBody' --type java --type kotlin"
tags: validation, spring-mvc
---
Bean Validation annotations (`@NotBlank`, `@Size`, `@Email`) on a DTO do nothing unless the parameter carries `@Valid`. Constraints on `@PathVariable`/`@RequestParam` need `@Validated` on the controller class. Requires `spring-boot-starter-validation` on the classpath. In Kotlin, annotate constructor properties with `@field:` or the constraint lands on the parameter and is ignored.

**Incorrect:**

```java
@PostMapping("/users")
UserDto create(@RequestBody CreateUserRequest body) { ... }
```

**Correct:**

```java
@PostMapping("/users")
UserDto create(@Valid @RequestBody CreateUserRequest body) { ... }
```

```kotlin
data class CreateUserRequest(@field:Email val email: String)
```

Reference: https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html
