---
id: flutter-isolate-heavy-work
title: Run heavy parsing and computation in Isolate.run, not on the UI isolate
impact: MEDIUM
impactDescription: "decoding a large payload blocks frames and the UI freezes for its duration"
roles: [implementer, reviewer]
tags: flutter, performance
---
Dart runs build, layout and your code on one isolate. Decoding large JSON, image processing, encryption or sorting thousands of items there drops frames. Move the work to `Isolate.run` (or `compute`), passing plain data in and out.

**Incorrect:**

```dart
final res = await dio.get<String>('/catalog');
final items = (jsonDecode(res.data!) as List).map(Product.fromJson).toList();
```

**Correct:**

```dart
final res = await dio.get<String>('/catalog');
final items = await Isolate.run(
    () => (jsonDecode(res.data!) as List).map((e) => Product.fromJson(e)).toList());
```

Reference: https://docs.flutter.dev/perf/isolates
