---
id: spring-di-constructor
title: Inject dependencies through the constructor into final fields, not @Autowired fields
impact: MEDIUM
impactDescription: "beans can be built half-wired in tests and circular dependencies hide until runtime"
roles: [implementer, reviewer]
check: "rg -n -A1 '@Autowired' --type java --type kotlin"
tags: di, spring
---
Field injection hides dependencies, cannot be `final`, and lets a unit test construct the class with nulls. A single constructor needs no `@Autowired`. In Kotlin, declare dependencies as `private val` constructor parameters.

**Incorrect:**

```java
@Service
public class InvoiceService {
  @Autowired private InvoiceRepository invoices;
}
```

**Correct:**

```java
@Service
public class InvoiceService {
  private final InvoiceRepository invoices;
  public InvoiceService(InvoiceRepository invoices) { this.invoices = invoices; }
}
```

```kotlin
@Service
class InvoiceService(private val invoices: InvoiceRepository)
```
