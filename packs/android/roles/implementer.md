# android · implementer
Applies when: `AndroidManifest.xml` present, or `com.android.application` in a Gradle build file
Read order: android-keystore-secrets, android-exported-components, android-network-security-config, android-coroutine-scope, android-compose-derived-state, android-hilt-inject

## Iron laws
- New manifest components are `android:exported="false"` unless the brief says another app must reach them. Thinking "it needs an intent-filter so it must be exported"? Check who sends the intent.

## Deviation rules
- Add libraries only when the brief lists them, through the version catalog (`gradle/libs.versions.toml`) when the project has one.
- Room schema change: add a `Migration` (or `AutoMigration`) and bump the database version in the same diff; never `fallbackToDestructiveMigration()` in release code.

## Output additions
- Manifest changed: components, permissions or `exported` values added.
- Room schema changed: version from → to, migration added yes/no.

## Obstacles to report
- Collecting flows in Compose with `collectAsState` where the project uses `collectAsStateWithLifecycle`: follow the project.
- A change that needs a new runtime permission: list it and where the request and denial path live.
