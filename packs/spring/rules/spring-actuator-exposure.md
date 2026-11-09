---
id: spring-actuator-exposure
title: Expose only health and info over HTTP; secure anything else behind an admin role
impact: CRITICAL
impactDescription: "/actuator/heapdump and /actuator/env leak passwords, tokens and session data to anyone"
roles: [implementer, reviewer, security]
check: "rg -n 'exposure.include' -g 'application*.yml' -g 'application*.yaml' -g 'application*.properties'"
tags: actuator, config
---
`management.endpoints.web.exposure.include=*` publishes heapdump, env, configprops, loggers and more. Name the endpoints you need. Any endpoint beyond `health` and `info` must be matched in the security chain to an admin role, or served on a separate management port that is not public.

**Incorrect:**

```yaml
management:
  endpoints:
    web:
      exposure:
        include: "*"
```

**Correct:**

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus
```

```java
.requestMatchers("/actuator/prometheus").hasRole("OPS")
```

Reference: https://docs.spring.io/spring-boot/reference/actuator/endpoints.html
