# spring · security
Applies when: Spring Boot in the Gradle or Maven build
Read order: spring-sec-deny-default, spring-actuator-exposure, spring-sec-csrf-explicit, spring-validate-valid, spring-config-profiles

## Also trace (no rule file yet)
- `@PreAuthorize`/`@Secured` present but no `@EnableMethodSecurity`: the checks never run.
- CORS: `allowedOriginPatterns("*")` with `allowCredentials(true)` reflects any origin with cookies.
- JWTs parsed or verified by hand instead of `oauth2ResourceServer(o -> o.jwt(...))` with an issuer and audience check.
- `@RequestMapping` without a method on a state-changing handler: it also answers GET, which CSRF protection skips.
- Spring Data REST repositories exported by default (`@RepositoryRestResource` or the starter on the classpath) bypass controller checks.
- `@Query` strings built with `+` or SpEL from request input.
