# flutter · verifier
Applies when: `pubspec.yaml` present

## Commands
- Subset: `flutter test test/path/to/widget_test.dart`, or `flutter test --name "regex"` / `--plain-name "exact text"` to filter by test name.
- Full: `flutter test`, `flutter analyze`, `dart format --output=none --set-exit-if-changed .`.
- E2E: `flutter test integration_test/<flow>_test.dart` needs a device or emulator; none available: INCONCLUSIVE.
- Never run `--update-goldens` to make a failure pass; report the golden diff.

## Obstacles to report
- Golden tests render fonts differently per OS; a golden failing locally but generated on CI (or the reverse) is environmental. Say which platform produced the goldens.
- Pure Dart packages in the repo (no `flutter:` SDK dependency) use `dart test`, not `flutter test`.
- Generated code out of date (`*.g.dart`): analyzer errors on missing members; report it, don't count as a regression of the change.
