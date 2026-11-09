---
id: expo-secure-store-tokens
title: Store tokens and secrets in expo-secure-store, never AsyncStorage
impact: CRITICAL
impactDescription: "session and refresh tokens readable in plain text from backups and rooted or jailbroken devices"
roles: [implementer, reviewer, security]
check: "rg -n -i 'AsyncStorage\.setItem\(.{0,40}(token|secret|session|jwt|password)'"
tags: expo, storage, auth
---
Source: an access token, refresh token, API credential or PIN. Sink: persistent storage. AsyncStorage and MMKV without encryption write plain files; `expo-secure-store` uses the iOS Keychain and an Android Keystore-backed cipher. Keep only non-sensitive preferences in AsyncStorage.

**Incorrect:**

```ts
await AsyncStorage.setItem('refreshToken', tokens.refresh)
```

**Correct:**

```ts
import * as SecureStore from 'expo-secure-store'

await SecureStore.setItemAsync('refreshToken', tokens.refresh, {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
})
```

Reference: https://docs.expo.dev/versions/latest/sdk/securestore/
