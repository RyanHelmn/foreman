---
id: android-keystore-secrets
title: Encrypt tokens with an Android Keystore key; never store them in plain SharedPreferences
impact: CRITICAL
impactDescription: "tokens sit in a plain XML file readable from backups and rooted devices"
roles: [implementer, reviewer, security]
check: "rg -n -i 'putString\(.{0,40}(token|secret|password|session)' --type kotlin"
tags: android, storage, auth
---
Source: access tokens, refresh tokens, API credentials. Sink: `SharedPreferences`, DataStore or files, which are plain on disk. Encrypt with an AES-GCM key generated in the Android Keystore (non-exportable) and store the ciphertext and IV. Use the project's existing wrapper if it has one. `EncryptedSharedPreferences` (androidx.security:security-crypto) is deprecated; don't add it to new code.

**Incorrect:**

```kotlin
prefs.edit().putString("refresh_token", tokens.refresh).apply()
```

**Correct:**

```kotlin
val spec = KeyGenParameterSpec.Builder("token_key", KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
  .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
  .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
  .build()
KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore").apply { init(spec) }.generateKey()
// encrypt with Cipher.getInstance("AES/GCM/NoPadding"); persist iv + ciphertext
```

Reference: https://developer.android.com/privacy-and-security/keystore
