# android · verifier
Applies when: `AndroidManifest.xml` present, or `com.android.application` in a Gradle build file

## Commands
- Subset (JVM unit tests, includes Robolectric): `./gradlew :app:testDebugUnitTest --tests 'com.example.orders.OrdersViewModelTest'`, or a method: `--tests '*OrdersViewModelTest.emits error on failure'`.
- Full: `./gradlew testDebugUnitTest`, then `./gradlew lintDebug`, and the project's static checks if configured (`./gradlew detekt`, `./gradlew ktlintCheck`).
- E2E-ish (Compose UI and instrumented tests): `./gradlew :app:connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=com.example.orders.OrdersScreenTest`. Needs a running emulator or device; none: INCONCLUSIVE.
- Multi-module projects: use the module path of the changed code (`:feature:orders:testDebugUnitTest`).

## Obstacles to report
- `--tests` with a filter that matches nothing fails with "No tests found for given includes"; that is a wrong filter, not a regression.
- A Gradle daemon or configuration-cache error unrelated to the change: rerun once with `--no-configuration-cache` before reporting.
