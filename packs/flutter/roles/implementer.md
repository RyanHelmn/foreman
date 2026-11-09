# flutter · implementer
Applies when: `pubspec.yaml` present
Read order: flutter-secure-storage-tokens, flutter-dart-define-no-secrets, flutter-tls-no-bypass, flutter-context-mounted, flutter-isolate-heavy-work, flutter-state-one-approach, flutter-const-widgets

## Iron laws
- No secret key in `--dart-define`, `.env` assets or Dart constants. Thinking "we obfuscate the release build"? That is the bug.

## Deviation rules
- Add packages with `flutter pub add <pkg>` only when the brief lists them; commit `pubspec.lock` changes for apps.
- Generated files (`*.g.dart`, `*.freezed.dart`): regenerate with `dart run build_runner build --delete-conflicting-outputs`, never hand-edit; say which were regenerated.

## Output additions
- Goldens updated: list each `.png` regenerated with `--update-goldens` and why the visual change is intended.

## Obstacles to report
- A key widget changed with no golden test: name it; add a `matchesGoldenFile` test only if the project already has goldens.
- Platform channel or plugin code that needs native setup (`Info.plist`, `AndroidManifest.xml`, Podfile): list the native files touched or needed.
