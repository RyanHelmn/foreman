# jvm · implementer
Applies when: pom.xml, build.gradle or build.gradle.kts present
Read order: jvm-sql-prepared, jvm-deser-untrusted, jvm-xml-xxe, jvm-resource-try-with, jvm-jpa-fetch-plan, jvm-null-no-bang, jvm-kotlin-structured-scope

## Iron laws
- No request value concatenated or templated into SQL, JPQL or a native query. Thinking "it's an enum from our own dropdown"? That is the bug.

## Deviation rules
- Schema changes go in a new Flyway (`V<n>__name.sql`) or Liquibase changeset; never edit one that has already been applied.
- Use the data layer the project already uses (JPA, jOOQ, Exposed, JdbcTemplate); don't introduce a second.
- Kotlin: model closed sets as `sealed` types or enums and DTOs as `data class`; match the file's existing style.

## Output additions
- Migration added: file name, or none.

## Obstacles to report
- Gradle vs Maven, and Kotlin vs Java, in the same repo: name which module you changed and its build file.
- A test that needs Docker (Testcontainers) when Docker is not running.
