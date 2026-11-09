---
id: android-coroutine-scope
title: Launch coroutines in a lifecycle scope, never GlobalScope
impact: HIGH
impactDescription: "work outlives the screen, leaks it, and writes results into state nobody observes"
roles: [implementer, reviewer]
check: "rg -n 'GlobalScope\.' --type kotlin"
tags: android, coroutines
---
Use `viewModelScope` in ViewModels, `lifecycleScope` / `repeatOnLifecycle` in UI, and `rememberCoroutineScope` or `LaunchedEffect` in Compose, so work is cancelled with its owner. Work that must survive the screen goes to WorkManager or an injected application scope. Don't catch `CancellationException` without rethrowing.

**Incorrect:**

```kotlin
fun refresh() {
  GlobalScope.launch { _orders.value = repo.orders() }
}
```

**Correct:**

```kotlin
fun refresh() {
  viewModelScope.launch { _orders.value = repo.orders() }
}
```

Reference: https://developer.android.com/kotlin/coroutines/coroutines-best-practices
