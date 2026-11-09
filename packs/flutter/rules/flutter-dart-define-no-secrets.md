---
id: flutter-dart-define-no-secrets
title: Never pass secret keys with --dart-define for builds that ship to users
impact: CRITICAL
impactDescription: "the key is a string constant in the shipped binary and anyone can extract and use it"
roles: [implementer, reviewer, security]
check: "rg -n -i 'fromEnvironment\(.{0,5}[A-Z_]*(SECRET|PRIVATE|SERVICE_ROLE)' lib"
tags: flutter, secrets
---
Source: `--dart-define` / `--dart-define-from-file` values. Sink: the compiled app, where `String.fromEnvironment` values are constants that `strings` recovers (obfuscation does not hide them). Only publishable values (API base URL, publishable keys, Sentry DSN) go there. Calls that need a secret key go through your backend, which authenticates the user.

**Incorrect:**

```dart
const openAiKey = String.fromEnvironment('OPENAI_SECRET_KEY');
final res = await dio.post('https://api.openai.com/v1/responses',
    options: Options(headers: {'Authorization': 'Bearer $openAiKey'}), data: body);
```

**Correct:**

```dart
final res = await api.post('/ai/complete', data: {'prompt': prompt});
```
