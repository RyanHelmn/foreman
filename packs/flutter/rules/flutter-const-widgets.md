---
id: flutter-const-widgets
title: Mark widget constructors and instances const where possible
impact: LOW
impactDescription: "unchanged subtrees are rebuilt on every parent rebuild"
roles: [implementer, reviewer]
tags: flutter, performance
---
A `const` widget instance is canonicalised, so Flutter skips rebuilding it when the parent rebuilds. Give stateless widgets `const` constructors and create static subtrees with `const`.

**Incorrect:**

```dart
class EmptyState extends StatelessWidget {
  EmptyState({super.key});
  @override
  Widget build(BuildContext context) => Padding(padding: EdgeInsets.all(16), child: Text('No orders'));
}
```

**Correct:**

```dart
class EmptyState extends StatelessWidget {
  const EmptyState({super.key});
  @override
  Widget build(BuildContext context) => const Padding(padding: EdgeInsets.all(16), child: Text('No orders'));
}
```
