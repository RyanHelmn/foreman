# android · security
Applies when: `AndroidManifest.xml` present, or `com.android.application` in a Gradle build file
Read order: android-keystore-secrets, android-exported-components, android-network-security-config

## Also trace (no rule file yet)
- `PendingIntent` created without `FLAG_IMMUTABLE` and with an implicit base intent: another app can fill in the target.
- `WebView` with `setJavaScriptEnabled(true)` plus `addJavascriptInterface` on content you don't control; `setAllowFileAccess(true)` on remote content.
- Content providers: `android:grantUriPermissions` and path permissions; `openFile` resolving a caller-supplied path (path traversal).
- Biometrics: `BiometricPrompt` gating a secret should pass a `CryptoObject` bound to a Keystore key with `setUserAuthenticationRequired(true)`, not just check the success callback.
- Logcat: `Log.*` lines with tokens, emails or request bodies ship in release unless stripped; other apps can't read them, but bug reports and `adb` can.
- `android:allowBackup="true"` (the default) without `dataExtractionRules` / `fullBackupContent` excluding token files.
- Secrets in `BuildConfig` fields or `local.properties`-injected values: compiled into the APK.

## Commands
- No built-in advisory audit for Gradle; list new artifacts with their version from the catalog or build file. Run `./gradlew lintDebug` for manifest and security lint checks.
