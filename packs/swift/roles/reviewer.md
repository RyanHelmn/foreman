# swift · reviewer
Applies when: `Package.swift`, an `.xcodeproj` or a `Podfile` present
Read order: swift-keychain-secrets, swift-biometric-keychain, swift-ats-no-arbitrary, swift-mainactor-ui, swift-task-structured, swift-no-force-unwrap, swift-log-privacy

## Blocker vs should-fix
- Blocker: secrets outside the Keychain; `NSAllowsArbitraryLoads`; force unwrap or `try!` on network, decoding or user input in a production path.
- Should-fix: UI state mutated without `@MainActor`; `Task {}` in `onAppear`; `@unchecked Sendable` or `nonisolated(unsafe)` added to quiet the compiler; strong `self` captured in a stored closure or long-lived `Task` (retain cycle).
- Nit: `DispatchQueue` in new code where the surrounding code uses async/await.
