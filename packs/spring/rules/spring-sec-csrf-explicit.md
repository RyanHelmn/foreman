---
id: spring-sec-csrf-explicit
title: Disable CSRF only on stateless token APIs, never on cookie-session apps
impact: HIGH
impactDescription: "another site submits state-changing requests with the victim's session cookie"
roles: [implementer, reviewer, security]
check: "rg -n 'csrf\\(.*disable' --type java --type kotlin"
tags: csrf, spring-security
---
Spring Security enables CSRF protection by default. `csrf(c -> c.disable())` is correct only when every request authenticates with a bearer token and the chain is `SessionCreationPolicy.STATELESS`. If any route authenticates by cookie (form login, session, `oauth2Login`), keep CSRF on, or ignore it only for the token-authenticated matcher.

**Incorrect (form login with CSRF off):**

```java
http.formLogin(Customizer.withDefaults())
    .csrf(csrf -> csrf.disable());
```

**Correct:**

```java
http.securityMatcher("/api/**")
    .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
    .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    .csrf(csrf -> csrf.disable());
```

Reference: https://docs.spring.io/spring-security/reference/features/exploits/csrf.html
