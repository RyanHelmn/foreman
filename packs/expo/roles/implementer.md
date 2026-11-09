# expo · implementer
Applies when: `expo` or `react-native` in package.json, or `app.config.*` / `eas.json` present
Read order: expo-secure-store-tokens, expo-public-env, expo-deeplink-validate, expo-oauth-pkce, expo-webview-origin, expo-cleartext-off, expo-ota-no-native, expo-list-stable-rows, expo-router-typed-routes, expo-permission-lazy-with-denial

## Iron laws
- Tokens and credentials go to `expo-secure-store`, never AsyncStorage. Thinking "it's only the refresh token"? That is the bug.
- No secret key in any `EXPO_PUBLIC_*` variable or `app.config` `extra`. Thinking "the bundle is minified"? That is the bug.

## Deviation rules
- Add native packages with `npx expo install <pkg>` only when the brief lists the package; it picks the SDK-compatible version.
- A change that adds a native module, config plugin or permission: say so, and bump or confirm the `runtimeVersion` policy in the same diff.
- Edit `app.json` / `app.config.*`, never generated `ios/` or `android/` folders in a Continuous Native Generation project (no committed native folders, or folders in `.gitignore`).

## Output additions
- Native layer changed: yes/no (new native dep, config plugin, permission, `ios`/`android` config). Yes means a store build, not `eas update`.

## Obstacles to report
- Gesture-driven animation belongs in Reanimated worklets (`useSharedValue`, `useAnimatedStyle`, `react-native-gesture-handler`), not `setState` per frame; report an existing screen that does otherwise rather than rewriting it.
- Platform differences go in `Platform.select` or `.ios.tsx` / `.android.tsx` files, matching what the codebase already uses.
- A native module that works in Expo Go but needs a development build (or the reverse): name it.
