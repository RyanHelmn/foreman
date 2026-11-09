---
id: jvm-kotlin-structured-scope
title: Launch coroutines in a structured scope, never GlobalScope
impact: MEDIUM
impactDescription: "work outlives the request, failures vanish unlogged and shutdown cannot cancel it"
roles: [implementer, reviewer]
check: "rg -n 'GlobalScope' --type kotlin"
tags: kotlin, coroutines
---
`GlobalScope.launch` and `runBlocking` inside a request handler detach work from the caller: exceptions are not propagated, cancellation never arrives, and `runBlocking` blocks a server thread. Use `coroutineScope { }` for fan-out inside a suspend function, or an injected application `CoroutineScope` with a `SupervisorJob` for fire-and-forget work.

**Incorrect:**

```kotlin
fun placeOrder(o: Order) {
  GlobalScope.launch { emailService.sendConfirmation(o) }
}
```

**Correct:**

```kotlin
suspend fun loadDashboard(id: UserId) = coroutineScope {
  val orders = async { orderClient.recent(id) }
  val profile = async { profileClient.get(id) }
  Dashboard(orders.await(), profile.await())
}

fun placeOrder(o: Order) {
  appScope.launch { emailService.sendConfirmation(o) }
}
```

Reference: https://kotlinlang.org/docs/coroutines-basics.html#structured-concurrency
