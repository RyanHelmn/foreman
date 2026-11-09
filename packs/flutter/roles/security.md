# flutter · security
Applies when: `pubspec.yaml` present
Read order: flutter-secure-storage-tokens, flutter-dart-define-no-secrets, flutter-tls-no-bypass

## Also trace (no rule file yet)
- Deep links (`go_router` / `app_links` routes): params validated, no sensitive action performed on open.
- `webview_flutter`: `JavaScriptChannel` handlers check the page origin; navigation restricted with a `NavigationDelegate`.
- `android:usesCleartextTraffic` / `NSAllowsArbitraryLoads` in the platform folders.
- Assets: `.env` or JSON config files listed under `flutter: assets:` ship in the app bundle.

## Commands
- `flutter pub outdated` when `pubspec.yaml` changed; there is no first-party advisory audit for pub, so check new packages' publisher and pub.dev score by hand.
