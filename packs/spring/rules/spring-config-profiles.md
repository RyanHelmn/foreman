---
id: spring-config-profiles
title: Keep dev-only settings in a dev profile, out of application.yml
impact: MEDIUM
impactDescription: "production starts with the H2 console open, schema auto-mutated, or SQL with bind values in logs"
roles: [implementer, reviewer, security]
check: "rg -n 'ddl-auto|h2.console.enabled|show-sql|include-stacktrace' -g 'application*.yml' -g 'application*.yaml' -g 'application*.properties'"
tags: config, profiles
---
`application.yml` is loaded in every environment. Settings meant for local work (`spring.h2.console.enabled`, `spring.jpa.hibernate.ddl-auto: update|create`, `spring.jpa.show-sql`, `server.error.include-stacktrace: always`) belong in `application-dev.yml`, activated with `spring.profiles.active=dev`. Production uses `ddl-auto: validate` or `none`, with schema changes through migrations.

**Incorrect (application.yml):**

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update
  h2:
    console:
      enabled: true
```

**Correct (application.yml, with the above moved to application-dev.yml):**

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
```

Reference: https://docs.spring.io/spring-boot/reference/features/profiles.html
