# swift · security
Applies when: `Package.swift`, an `.xcodeproj` or a `Podfile` present
Read order: swift-keychain-secrets, swift-biometric-keychain, swift-ats-no-arbitrary, swift-log-privacy

## Also trace (no rule file yet)
- Custom URL schemes and universal links (`onOpenURL`, `application(_:open:options:)`): params validated, no sensitive action without confirmation.
- `WKWebView`: `WKScriptMessageHandler` checks `message.frameInfo.securityOrigin`; no tokens injected into page script.
- `URLSessionDelegate` `didReceive challenge` handlers that call `completionHandler(.useCredential, …)` without evaluating the trust: TLS bypass.
- Secrets compiled into the app (`.xcconfig`, `Info.plist`, string literals): public.
- Sensitive screens hidden in the app switcher snapshot (blur on `scenePhase` change to `.inactive`).

## Commands
- No first-party advisory audit for SwiftPM or CocoaPods; list new packages with their source URL and pinned version from `Package.resolved` or `Podfile.lock`.
