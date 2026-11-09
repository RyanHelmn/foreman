# flutter · reviewer
Applies when: `pubspec.yaml` present
Read order: flutter-secure-storage-tokens, flutter-dart-define-no-secrets, flutter-tls-no-bypass, flutter-context-mounted, flutter-isolate-heavy-work, flutter-state-one-approach, flutter-const-widgets

## Blocker vs should-fix
- Blocker: `badCertificateCallback` returning true outside a debug-only branch; tokens in `SharedPreferences`.
- Should-fix: a second state-management approach; unguarded `BuildContext` after `await`; controllers (`TextEditingController`, `AnimationController`, `StreamSubscription`) created in `State` without `dispose`.
- Nit: missing `const` on new widgets.

## Obstacles to report
- Golden files changed in the diff without a matching widget change: ask why.
