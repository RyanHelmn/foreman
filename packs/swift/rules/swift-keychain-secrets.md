---
id: swift-keychain-secrets
title: Store tokens and credentials in the Keychain, never UserDefaults or files
impact: CRITICAL
impactDescription: "tokens sit in a plain plist that is included in backups and readable on a jailbroken device"
roles: [implementer, reviewer, security]
check: "rg -n -i 'UserDefaults.{0,40}set\(.{0,40}(token|secret|password|session)'"
tags: swift, storage, auth
---
Source: access tokens, refresh tokens, API credentials. Sink: persistent storage. `UserDefaults`, `@AppStorage` and files in the app container are unencrypted at rest beyond file protection. Use the Keychain with an accessibility class that excludes backups (`…ThisDeviceOnly`), through the project's existing Keychain wrapper if it has one.

**Incorrect:**

```swift
UserDefaults.standard.set(tokens.refresh, forKey: "refreshToken")
```

**Correct:**

```swift
let query: [String: Any] = [
  kSecClass as String: kSecClassGenericPassword,
  kSecAttrAccount as String: "refreshToken",
  kSecValueData as String: Data(tokens.refresh.utf8),
  kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
]
let status = SecItemAdd(query as CFDictionary, nil)
guard status == errSecSuccess else { throw KeychainError(status) }
```
