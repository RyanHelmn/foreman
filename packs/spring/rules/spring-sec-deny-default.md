---
id: spring-sec-deny-default
title: End the SecurityFilterChain with anyRequest().authenticated() and permit public paths by name
impact: CRITICAL
impactDescription: "every endpoint not listed in the matcher chain is reachable without a session"
roles: [implementer, reviewer, security]
check: "rg -n 'anyRequest\\(\\)\\.permitAll|permitAll\\(\\)' --type java --type kotlin"
tags: auth, spring-security
---
The `authorizeHttpRequests` chain must close with `anyRequest().authenticated()` (or `denyAll()`), so a new controller is protected without anyone remembering it. Public routes are listed explicitly. Per-object rules go in `@PreAuthorize` on the service method, which needs `@EnableMethodSecurity` on a configuration class or the annotation is silently ignored.

**Incorrect:**

```java
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/admin/**").hasRole("ADMIN")
    .anyRequest().permitAll());
```

**Correct:**

```java
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/login", "/actuator/health").permitAll()
    .requestMatchers("/admin/**").hasRole("ADMIN")
    .anyRequest().authenticated());
```

Reference: https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html
