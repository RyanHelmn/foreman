---
id: flutter-context-mounted
title: Check context.mounted before using BuildContext after an await
impact: HIGH
impactDescription: "navigation or a SnackBar on a disposed widget throws, or acts on the wrong screen"
roles: [implementer, reviewer]
check: "flutter analyze (use_build_context_synchronously)"
tags: flutter, async
---
After any `await`, the widget may be gone. Check `context.mounted` (or `mounted` in a `State`) before calling `Navigator.of(context)`, `ScaffoldMessenger.of(context)` or `Theme.of(context)`. The `use_build_context_synchronously` lint flags the unguarded form.

**Incorrect:**

```dart
onPressed: () async {
  await repo.save(order);
  Navigator.of(context).pop();
}
```

**Correct:**

```dart
onPressed: () async {
  await repo.save(order);
  if (!context.mounted) return;
  Navigator.of(context).pop();
}
```

Reference: https://dart.dev/tools/linter-rules/use_build_context_synchronously
