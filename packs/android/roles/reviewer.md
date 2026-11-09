# android · reviewer
Applies when: `AndroidManifest.xml` present, or `com.android.application` in a Gradle build file
Read order: android-keystore-secrets, android-exported-components, android-network-security-config, android-coroutine-scope, android-compose-derived-state, android-hilt-inject

## Blocker vs should-fix
- Blocker: a new exported component without validation or permission; cleartext or user CAs in the main network config; a Room version bump without a migration.
- Should-fix: `GlobalScope`; `CancellationException` swallowed by a broad `catch (e: Exception)` in a coroutine; state read in composition that should be `derivedStateOf`; an unstable lambda or collection parameter that defeats skipping in a hot list item.
- Nit: dependencies constructed by hand where a Hilt binding already exists.
