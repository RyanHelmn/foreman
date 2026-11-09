# swift · verifier
Applies when: `Package.swift`, an `.xcodeproj` or a `Podfile` present

## Commands
- SwiftPM package: subset `swift test --filter LoginTests` (or `LoginTests/testRejectsExpiredToken`); full `swift test`.
- Xcode project: subset `xcodebuild test -scheme <App> -destination 'platform=iOS Simulator,name=<device>' -only-testing:<AppTests>/<LoginTests>/<testName>`; full: the same without `-only-testing`. Use `-workspace App.xcworkspace` instead of the project when a `Podfile` exists.
- Pick `<device>` from `xcrun simctl list devices available`; a missing simulator name fails before building.
- E2E: UI test targets (`-only-testing:<AppUITests>`) only for the flows the brief names.
- Lint: `swiftlint` when `.swiftlint.yml` exists.

## Obstacles to report
- A wrong `-only-testing` identifier can run zero tests and still succeed: confirm the log shows `Executed N tests` with N > 0.
- No Xcode or simulator on the machine (Linux CI): INCONCLUSIVE, not FAILED.
- UI tests depend on simulator state and animations; a single failure that passes on rerun is flaky.
