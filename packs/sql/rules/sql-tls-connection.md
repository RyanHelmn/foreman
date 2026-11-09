---
id: sql-tls-connection
title: Connect to remote databases over TLS that verifies the server
impact: HIGH
impactDescription: "credentials and every row cross the network readable, or go to an impostor server"
roles: [implementer, reviewer, security]
check: "rg -n 'sslmode=disable|rejectUnauthorized:\s*false|ssl:\s*false' --glob '!**/node_modules/**'"
tags: access, sql
---
Source: the network path between app and database. Sink: the connection string or driver TLS options. Remote connections use `sslmode=verify-full` (libpq-style Postgres clients) or `ssl-mode=VERIFY_IDENTITY` (MySQL) with the provider's CA; libpq's `sslmode=require` encrypts but accepts any certificate. `sslmode=disable`, `ssl: false` or `rejectUnauthorized: false` in configuration that reaches a non-local database is the finding.

**Incorrect:**

```ini
DATABASE_URL=postgres://app_rw:pw@db.example.com:5432/app?sslmode=disable
```

**Correct:**

```ini
DATABASE_URL=postgres://app_rw:pw@db.example.com:5432/app?sslmode=verify-full&sslrootcert=/etc/ssl/db-ca.pem
```
