# jvm · security
Applies when: pom.xml, build.gradle or build.gradle.kts present
Read order: jvm-sql-prepared, jvm-deser-untrusted, jvm-xml-xxe

## Also trace (no rule file yet)
- `Runtime.exec` / `ProcessBuilder` with request input, especially `"sh", "-c", ...` or a single concatenated command string.
- `XMLDecoder`, SnakeYAML `new Yaml().load` (pre-2.0 constructs arbitrary types), XStream without an allowlist.
- Request input reaching `Paths.get`/`new File` without normalising and checking the result stays under a fixed root.

## Commands
- `./gradlew dependencyCheckAnalyze` or `mvn org.owasp:dependency-check-maven:check` when the OWASP plugin is configured; otherwise report that no JVM advisory scan exists.
