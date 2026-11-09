---
id: swift-biometric-keychain
title: Gate secrets behind biometrics with Keychain access control, not an LAContext boolean
impact: HIGH
impactDescription: "a hooked evaluatePolicy callback returns true and unlocks the account without a face or finger"
roles: [implementer, reviewer, security]
check: "rg -n 'evaluatePolicy' --type swift"
tags: swift, auth, biometrics
---
Source: the result of `LAContext.evaluatePolicy`. Sink: unlocking a session or showing secrets. A boolean in app memory is bypassable on a jailbroken device. Store the secret with `SecAccessControlCreateWithFlags(…, .biometryCurrentSet, …)` so the Keychain itself requires the biometric match, and enrolling a new finger invalidates the item.

**Incorrect:**

```swift
context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: "Unlock") { ok, _ in
  if ok { session.unlock(token: storedToken) }
}
```

**Correct:**

```swift
let access = SecAccessControlCreateWithFlags(nil, kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly, .biometryCurrentSet, nil)!
let query: [String: Any] = [kSecClass as String: kSecClassGenericPassword, kSecAttrAccount as String: "refreshToken",
  kSecValueData as String: Data(token.utf8), kSecAttrAccessControl as String: access]
SecItemAdd(query as CFDictionary, nil)
```
