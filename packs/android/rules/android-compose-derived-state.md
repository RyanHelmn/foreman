---
id: android-compose-derived-state
title: Wrap values derived from fast-changing state in remember { derivedStateOf { } }
impact: MEDIUM
impactDescription: "the composable recomposes on every scroll pixel instead of when the derived value flips"
roles: [implementer, reviewer]
tags: android, compose, performance
---
Reading scroll position, text or animation state directly in a composable recomposes it on every change. When only a derived result matters (button visible, form valid), compute it in `remember { derivedStateOf { … } }`. Use `remember(key)` for expensive calculations from ordinary parameters; `derivedStateOf` is only for state that changes more often than the result.

**Incorrect:**

```kotlin
val showScrollToTop = listState.firstVisibleItemIndex > 0
```

**Correct:**

```kotlin
val showScrollToTop by remember { derivedStateOf { listState.firstVisibleItemIndex > 0 } }
```

Reference: https://developer.android.com/develop/ui/compose/side-effects#derivedstateof
