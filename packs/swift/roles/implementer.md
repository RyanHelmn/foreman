# swift · implementer
Applies when: `Package.swift`, an `.xcodeproj` or a `Podfile` present
Read order: swift-keychain-secrets, swift-biometric-keychain, swift-ats-no-arbitrary, swift-mainactor-ui, swift-task-structured, swift-no-force-unwrap, swift-log-privacy

## Iron laws
- Tokens and credentials live in the Keychain only. Thinking "UserDefaults is sandboxed"? That is the bug.

## Deviation rules
- New files must be added to the Xcode target. In a project without folder references or synchronized groups, that means editing `project.pbxproj`; if you can't do it safely, report BLOCKED with the file list rather than leaving files outside the target.
- Add Swift packages only when the brief lists them; report the `Package.resolved` change.

## Output additions
- Targets touched: app, extensions, test targets.
- Info.plist or entitlements changed: list keys.

## Obstacles to report
- Swift 6 strict concurrency errors in code you didn't touch, surfaced by your change: name them, don't silence with `@unchecked Sendable` or `nonisolated(unsafe)`.
- Generated code (SwiftGen, Sourcery, protobuf) that needs regenerating.
