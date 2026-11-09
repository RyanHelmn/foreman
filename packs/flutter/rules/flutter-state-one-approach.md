---
id: flutter-state-one-approach
title: Use the project's existing state approach for new screens
impact: MEDIUM
impactDescription: "two state systems hold the same data and drift, and every screen needs both mental models"
roles: [implementer, reviewer]
tags: flutter, state
---
A project uses one state approach (Riverpod, Bloc, Provider). New features use it the same way neighbours do: providers or blocs for shared and async state, `setState` only for state local to one widget. Don't add a second package or hand-rolled `ChangeNotifier` singletons.

**Incorrect (Riverpod project):**

```dart
class CartController extends ChangeNotifier { static final instance = CartController(); … }
```

**Correct:**

```dart
@riverpod
class Cart extends _$Cart {
  @override
  List<CartItem> build() => [];
  void add(CartItem item) => state = [...state, item];
}
```
