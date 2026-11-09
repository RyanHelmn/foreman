---
id: android-exported-components
title: Export only components meant for other apps, and protect the ones you export
impact: HIGH
impactDescription: "any installed app can start the activity or send the broadcast and trigger its action with forged extras"
roles: [implementer, reviewer, security]
check: "rg -n 'android:exported=\"true\"' --glob 'AndroidManifest.xml'"
tags: android, ipc
---
Source: an `Intent` from another app (extras, data URI). Sink: the exported activity, service, receiver or provider acting on it. Set `android:exported="false"` unless another app must reach the component. A launcher or deep-link activity is exported: validate its extras and URI, and never perform a sensitive action on open. Receivers and services shared with your own apps take a `signature` permission.

**Incorrect:**

```xml
<receiver android:name=".sync.ResetAccountReceiver" android:exported="true">
  <intent-filter><action android:name="com.example.RESET_ACCOUNT" /></intent-filter>
</receiver>
```

**Correct:**

```xml
<receiver android:name=".sync.ResetAccountReceiver" android:exported="false" />
```

Reference: https://developer.android.com/privacy-and-security/risks/android-exported
