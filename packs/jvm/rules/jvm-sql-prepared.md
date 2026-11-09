---
id: jvm-sql-prepared
title: Bind SQL and JPQL values with PreparedStatement or named parameters
impact: CRITICAL
impactDescription: "SQL injection from any request value concatenated into a statement or query string"
roles: [implementer, reviewer, security]
check: "rg -n 'createStatement\\(|(executeQuery|createQuery|createNativeQuery|nativeQuery)\\(\\s*\"[^\"]*\"\\s*\\+' --type java --type kotlin"
tags: sql, jdbc, jpa
---
Source: a request value. Sink: `Statement.execute*`, `EntityManager.createQuery`/`createNativeQuery`, `JdbcTemplate.query`, or a `@Query` string built with `+` or string templates. JPQL is injectable exactly like SQL. Use `?`/`:name` placeholders and bind; for dynamic `ORDER BY`, map the input to a fixed set of column names.

**Incorrect:**

```java
var rs = conn.createStatement().executeQuery("SELECT * FROM users WHERE email = '" + email + "'");
em.createQuery("from Order o where o.status = '" + status + "'").getResultList();
```

**Correct:**

```java
var ps = conn.prepareStatement("SELECT * FROM users WHERE email = ?");
ps.setString(1, email);
em.createQuery("from Order o where o.status = :status", Order.class).setParameter("status", status).getResultList();
```

Reference: https://cheatsheetseries.owasp.org/cheatsheets/Query_Parameterization_Cheat_Sheet.html
