# jvm · reviewer
Applies when: pom.xml, build.gradle or build.gradle.kts present
Read order: jvm-sql-prepared, jvm-deser-untrusted, jvm-xml-xxe, jvm-resource-try-with, jvm-jpa-fetch-plan, jvm-null-no-bang, jvm-kotlin-structured-scope

## Blocker vs should-fix
- Blocker: jvm-sql-prepared, jvm-deser-untrusted or jvm-xml-xxe on any input path; an applied Flyway/Liquibase migration edited in place.
- Should-fix: jvm-resource-try-with, jvm-jpa-fetch-plan; `FetchType.EAGER` added to fix a lazy-load error.
- Nit: jvm-null-no-bang on values that are provably present.
