---
id: sql-least-privilege-user
title: Connect the app as a role with table DML only; no superuser, owner or DDL rights
impact: HIGH
impactDescription: "one injection becomes DROP TABLE, reads of every schema, or on a Postgres superuser shell commands via COPY ... PROGRAM"
roles: [implementer, reviewer, security]
tags: access, sql
---
Source: an injection or a leaked app credential. Sink: the privileges of the role in the app's connection string. The runtime role gets `SELECT, INSERT, UPDATE, DELETE` on its tables and sequence usage; migrations run as a separate owner role in the deploy step. A diff that points the app at `postgres`/`root` or the owner role, or grants it `ALL`, `SUPERUSER`, `CREATE` or `GRANT OPTION`, is the finding.

**Incorrect:**

```sql
GRANT ALL PRIVILEGES ON DATABASE app TO app_user;
ALTER ROLE app_user SUPERUSER;
```

**Correct (PostgreSQL):**

```sql
GRANT USAGE ON SCHEMA public TO app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_rw;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_rw;
ALTER DEFAULT PRIVILEGES FOR ROLE app_owner IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_rw;
```

**Correct (MySQL):**

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON app.* TO 'app_rw'@'%';
```
