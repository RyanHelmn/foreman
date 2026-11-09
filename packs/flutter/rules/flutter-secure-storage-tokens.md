---
id: flutter-secure-storage-tokens
title: Store tokens in flutter_secure_storage, never SharedPreferences
impact: CRITICAL
impactDescription: "session tokens sit in a plain XML or plist file readable from backups and rooted devices"
roles: [implementer, reviewer, security]
check: "rg -n -i 'setString\(.{0,30}(token|secret|session|jwt|password)' lib"
tags: flutter, storage, auth
---
Source: access tokens, refresh tokens, API credentials, PINs. Sink: persistent storage. `SharedPreferences` and Hive boxes without encryption write plain files. `flutter_secure_storage` uses the iOS Keychain and Android Keystore-backed encryption.

**Incorrect:**

```dart
final prefs = await SharedPreferences.getInstance();
await prefs.setString('refresh_token', tokens.refresh);
```

**Correct:**

```dart
const storage = FlutterSecureStorage();
await storage.write(key: 'refresh_token', value: tokens.refresh);
```

Reference: https://pub.dev/packages/flutter_secure_storage
