---
id: expo-permission-lazy-with-denial
title: Request permissions at the point of use and handle permanent denial
impact: MEDIUM
impactDescription: "a launch-time prompt gets denied, and the feature then fails silently with no way back to settings"
roles: [implementer, reviewer]
tags: expo, permissions
---
Ask for camera, location, notifications or contacts when the user starts the feature that needs it, not on launch. Handle `granted: false`: when `canAskAgain` is false the OS will not prompt again, so show an explanation with `Linking.openSettings()`.

**Incorrect (`app/_layout.tsx`):**

```tsx
useEffect(() => { Camera.requestCameraPermissionsAsync() }, [])
```

**Correct (scan screen):**

```tsx
const [permission, requestPermission] = useCameraPermissions()
if (!permission?.granted) {
  return permission?.canAskAgain === false
    ? <Denied onOpenSettings={() => Linking.openSettings()} />
    : <Explain onContinue={requestPermission} />
}
```

Reference: https://docs.expo.dev/guides/permissions/
