---
id: expo-ota-no-native
title: Ship native changes as a store build with a new runtimeVersion, never as an OTA update
impact: HIGH
impactDescription: "installed apps load JS that calls a native module they don't contain and crash on launch"
roles: [implementer, reviewer, verifier]
tags: expo, eas-update, release
---
An EAS Update runs only on builds with the same `runtimeVersion`. Adding or upgrading a package with native code, changing a config plugin, permissions, or `ios`/`android` config changes the native layer, so it needs a new build and a new runtime version. Use `"runtimeVersion": { "policy": "fingerprint" }` so native changes change the runtime automatically; with a manual string or `appVersion` policy, bump it in the same diff.

**Incorrect (diff adds a native module, runtime unchanged, shipped with `eas update`):**

```json
"dependencies": { "react-native-vision-camera": "^4.0.0" },
"runtimeVersion": "1.4.0"
```

**Correct:**

```json
"runtimeVersion": { "policy": "fingerprint" }
```

Reference: https://docs.expo.dev/eas-update/runtime-versions/
