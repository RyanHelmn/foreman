# expo · security
Applies when: `expo` or `react-native` in package.json, or `app.config.*` / `eas.json` present
Read order: expo-secure-store-tokens, expo-public-env, expo-deeplink-validate, expo-oauth-pkce, expo-webview-origin, expo-cleartext-off

## Iron laws
- Everything in the JS bundle is public: `EXPO_PUBLIC_*`, `extra`, string literals. Thinking "nobody decompiles a mobile app"? That is the bug.

## Also trace (no rule file yet)
- OTA updates: if the app handles money or health data, `updates.codeSigningCertificate` and `codeSigningMetadata` are set so a compromised update host can't push JS.
- Sensitive screens (card details, OTP, recovery codes): `expo-screen-capture` (`usePreventScreenCapture`) and no `Clipboard.setStringAsync` of secrets without clearing.
- Associated domains / intent filters: universal and app links verified (`apple-app-site-association`, `assetlinks.json`) so another app can't claim the same scheme for auth redirects.
- Backend proxy endpoints added for third-party keys: authenticated and rate-limited per user.

## Commands
- `npm audit --omit=dev` (or the project's package manager equivalent) when package.json or the lockfile changed.
- `npx expo config --type public` prints the config embedded in the app; anything secret in it is a finding.

## Output additions
- Bundle exposure: every new `EXPO_PUBLIC_*` or `extra` key, with whether its value is publishable.
