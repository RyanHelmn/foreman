---
id: go-sql-placeholders
title: Pass query values as database/sql placeholder args, never fmt.Sprintf them in
impact: CRITICAL
impactDescription: "a request value reads or deletes any table (SQL injection)"
roles: [implementer, reviewer, security]
check: "rg -n 'Sprintf\\(\"(SELECT|INSERT|UPDATE|DELETE|select|insert|update|delete)' --type go"
tags: security, go, sql
---
Source: request values. Sink: `db.QueryContext`, `ExecContext`, `QueryRowContext`, pgx `Query`/`Exec`. Placeholders are driver-specific (`$1` for Postgres/pgx, `?` for MySQL/SQLite); use the one the project uses and pass values as args. Identifiers (column, sort direction) can't be placeholders: map them through a fixed allowlist.

**Incorrect:**

```go
q := fmt.Sprintf("SELECT id, total FROM orders WHERE status = '%s' ORDER BY %s", status, sort)
rows, err := db.QueryContext(ctx, q)
```

**Correct:**

```go
col, ok := sortColumns[sort]
if !ok {
	col = "created_at"
}
rows, err := db.QueryContext(ctx, "SELECT id, total FROM orders WHERE status = $1 ORDER BY "+col, status)
```

Reference: https://go.dev/doc/database/sql-injection
