# spring · implementer
Applies when: Spring Boot in the Gradle or Maven build
Read order: spring-sec-deny-default, spring-actuator-exposure, spring-sec-csrf-explicit, spring-validate-valid, spring-tx-service, spring-di-constructor, spring-config-profiles

## Iron laws
- A new controller is covered by the security chain's `anyRequest().authenticated()` or an explicit matcher, and object-level checks run in the service. Thinking "the gateway already authenticates"? That is the bug.

## Deviation rules
- Added a `@PreAuthorize` and found no `@EnableMethodSecurity`: report it; don't assume the annotation works.
- Prod-only values come from environment variables or a profile file, never hard-coded defaults in `application.yml`.

## Output additions
- Security chain changed: yes/no, with the matcher added.

## Obstacles to report
- Two `SecurityFilterChain` beans without `securityMatcher`/`@Order`: which one wins is not obvious; name it.
- `ddl-auto: update` already in the shared config: report it rather than relying on it for your schema change.
