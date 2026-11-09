---
id: expo-cleartext-off
title: Keep cleartext traffic off and ATS on in production app config
impact: HIGH
impactDescription: "tokens and personal data travel unencrypted on any shared network"
roles: [implementer, reviewer, security]
check: "rg -n 'usesCleartextTraffic.{0,3}true|NSAllowsArbitraryLoads.{0,3}true'"
tags: expo, network
---
Production builds talk to HTTPS only. Enabling `usesCleartextTraffic` (via `expo-build-properties`) or `NSAllowsArbitraryLoads` disables the platform's transport protection for every request. A local dev server needs neither: Expo dev builds already allow the Metro connection. If one legacy HTTP host is unavoidable, scope an ATS exception domain to it and gate it on the build profile.

**Incorrect (`app.json`):**

```json
"ios": { "infoPlist": { "NSAppTransportSecurity": { "NSAllowsArbitraryLoads": true } } },
"plugins": [["expo-build-properties", { "android": { "usesCleartextTraffic": true } }]]
```

**Correct:**

```json
"plugins": [["expo-build-properties", { "android": { "usesCleartextTraffic": false } }]]
```

Reference: https://docs.expo.dev/versions/latest/sdk/build-properties/
