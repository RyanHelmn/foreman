---
id: swift-task-structured
title: Tie async work to view lifetime with .task, not unstructured Task in onAppear
impact: MEDIUM
impactDescription: "requests keep running after the view disappears and write stale results back"
roles: [implementer, reviewer]
check: "rg -n 'onAppear\s*\{\s*Task' --type swift"
tags: swift, concurrency, swiftui
---
Work started in `.task { }` is cancelled when the view disappears, and `.task(id:)` restarts it when the id changes. `Task { }` inside `onAppear`, and `Task.detached`, are never cancelled unless you store and cancel the handle. For parallel work use `async let` or a task group so children cancel with the parent.

**Incorrect:**

```swift
.onAppear { Task { await model.load(orderID) } }
```

**Correct:**

```swift
.task(id: orderID) { await model.load(orderID) }
```

Reference: https://developer.apple.com/documentation/swiftui/view/task(id:priority:_:)
