---
id: net-ef-raw-sql
title: Use FromSql/FromSqlInterpolated or explicit parameters, never FromSqlRaw with concatenation
impact: CRITICAL
impactDescription: "SQL injection from any request value built into the SQL string"
roles: [implementer, reviewer, security]
check: "rg -n '(FromSqlRaw|ExecuteSqlRaw|ExecuteSqlRawAsync)\\(\\s*(\\$\"|\"[^\"]*\"\\s*\\+)' --type cs"
tags: sql, efcore, dapper
---
Source: request values. Sink: `FromSqlRaw`, `ExecuteSqlRaw(Async)`, Dapper `Query` or `SqlCommand.CommandText` with a concatenated or `$"..."` string. `FromSqlRaw($"...{x}")` is not parameterised: the string is built before EF sees it. `FromSql`/`FromSqlInterpolated` and `ExecuteSql(Async)` turn interpolation holes into parameters. With Dapper, pass an anonymous parameter object.

**Incorrect:**

```csharp
var users = db.Users.FromSqlRaw($"SELECT * FROM Users WHERE Email = '{email}'").ToList();
conn.Query<Order>("SELECT * FROM Orders WHERE Status = '" + status + "'");
```

**Correct:**

```csharp
var users = db.Users.FromSqlInterpolated($"SELECT * FROM Users WHERE Email = {email}").ToList();
conn.Query<Order>("SELECT * FROM Orders WHERE Status = @status", new { status });
```

Reference: https://learn.microsoft.com/ef/core/querying/sql-queries
