# spring · reviewer
Applies when: Spring Boot in the Gradle or Maven build
Read order: spring-sec-deny-default, spring-actuator-exposure, spring-sec-csrf-explicit, spring-validate-valid, spring-tx-service, spring-di-constructor, spring-config-profiles

## Blocker vs should-fix
- Blocker: spring-sec-deny-default, spring-actuator-exposure; CSRF disabled on a chain with form login or sessions; `@Transactional` on a private or self-invoked method guarding multi-row writes.
- Should-fix: a `@RequestBody` without `@Valid`; dev settings in `application.yml`; `@Transactional` on controllers.
- Nit: field injection in a class the diff only touches.
