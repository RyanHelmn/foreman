---
id: android-network-security-config
title: No cleartext traffic or user-installed CAs in release builds
impact: HIGH
impactDescription: "tokens travel unencrypted, or any user-installed certificate can intercept TLS"
roles: [implementer, reviewer, security]
check: "rg -n 'usesCleartextTraffic=\"true\"|cleartextTrafficPermitted=\"true\"' --glob '*.xml'"
tags: android, network
---
Cleartext is blocked by default from API 28. `android:usesCleartextTraffic="true"`, `cleartextTrafficPermitted="true"` in a `base-config`, or trusting `user` certificates turns that off for the whole app. Put debug-only allowances (local server, proxy CA) in `<debug-overrides>` or a `src/debug` network security config.

**Incorrect (`res/xml/network_security_config.xml` in main):**

```xml
<network-security-config>
  <base-config cleartextTrafficPermitted="true">
    <trust-anchors><certificates src="system" /><certificates src="user" /></trust-anchors>
  </base-config>
</network-security-config>
```

**Correct:**

```xml
<network-security-config>
  <debug-overrides>
    <trust-anchors><certificates src="user" /></trust-anchors>
  </debug-overrides>
</network-security-config>
```

Reference: https://developer.android.com/privacy-and-security/security-config
