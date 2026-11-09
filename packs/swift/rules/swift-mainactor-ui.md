---
id: swift-mainactor-ui
title: Mark view models and UI state @MainActor
impact: HIGH
impactDescription: "published state mutated off the main thread produces purple runtime warnings, torn UI and crashes"
roles: [implementer, reviewer]
tags: swift, concurrency, swiftui
---
State that SwiftUI observes (`ObservableObject`, `@Observable`) is mutated on the main actor. Annotate the type `@MainActor` so the compiler enforces it, instead of hopping with `DispatchQueue.main.async`. Do network and decoding work in `async` functions it awaits.

**Incorrect:**

```swift
final class OrdersModel: ObservableObject {
  @Published var orders: [Order] = []
  func load() {
    api.fetchOrders { result in self.orders = (try? result.get()) ?? [] }
  }
}
```

**Correct:**

```swift
@MainActor
final class OrdersModel: ObservableObject {
  @Published var orders: [Order] = []
  @Published var error: Error?
  func load() async {
    do { orders = try await api.orders() } catch { self.error = error }
  }
}
```
