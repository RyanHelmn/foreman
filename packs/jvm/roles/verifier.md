# jvm · verifier
Applies when: pom.xml, build.gradle or build.gradle.kts present

## Commands
- Gradle subset: `./gradlew test --tests 'com.acme.billing.InvoiceServiceTest'`, one method: `--tests 'com.acme.billing.InvoiceServiceTest.rejectsNegativeTotal'`; multi-module: `./gradlew :billing:test --tests '...'`.
- Maven subset: `mvn -Dtest=InvoiceServiceTest test`, one method: `-Dtest='InvoiceServiceTest#rejectsNegativeTotal'`; multi-module: `mvn -pl billing -am -Dtest=InvoiceServiceTest -Dsurefire.failIfNoSpecifiedTests=false test`.
- Full: `./gradlew build` or `mvn verify` (also runs Failsafe `*IT` integration tests when configured).

## Obstacles to report
- `Task :test UP-TO-DATE` or `FROM-CACHE` means nothing ran; rerun with `--rerun-tasks` (or `cleanTest test`) before reporting PASS.
- Failsafe `*IT` classes do not run under `mvn test`; a PASS from `mvn test` says nothing about them.
- Testcontainers tests failing with "Could not find a valid Docker environment": INCONCLUSIVE, not FAILED.
