---
id: swift-no-force-unwrap
title: No force unwraps or try! on runtime data in production code
impact: MEDIUM
impactDescription: "an unexpected nil or decode failure crashes the app instead of showing an error"
roles: [implementer, reviewer]
check: "rg -n 'try!|as!|[A-Za-z0-9_)\]]!(\.|\s|\))' --type swift --glob '!*Tests*'"
tags: swift, crashes
---
`!`, `try!` and `as!` crash on failure. Use them only for values that cannot fail at runtime (a literal URL, a bundled resource checked by tests). Data from the network, user input, the Keychain or decoding uses `guard let`, `if let` or `do/catch` and a visible error state.

**Incorrect:**

```swift
let url = URL(string: "https://api.example.com/orders/\(id)")!
let order = try! JSONDecoder().decode(Order.self, from: data)
```

**Correct:**

```swift
guard let url = URL(string: "https://api.example.com/orders/\(id)") else { throw APIError.badURL }
let order = try JSONDecoder().decode(Order.self, from: data)
```
