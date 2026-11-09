---
id: rs-sqlx-bind
title: Use sqlx query!/query_as! macros or .bind(), never format! into SQL
impact: CRITICAL
impactDescription: "a request value reads or deletes any table (SQL injection)"
roles: [implementer, reviewer, security]
check: "rg -n 'query(_as|_scalar)?(::<[^>]*>)?\\(&?format!' --type rust"
tags: security, rust, sql
---
Source: request values. Sink: `sqlx::query`, `query_as`, `query_scalar`, diesel `sql_query`, sea-orm raw statements. The `query!`/`query_as!` macros check SQL against the schema at compile time and bind args; the function forms bind only through `.bind()`. Identifiers can't be bound: map them through a fixed match. Dynamic filters use `QueryBuilder::push_bind`.

**Incorrect:**

```rust
let sql = format!("SELECT id, total FROM orders WHERE status = '{status}'");
let rows = sqlx::query_as::<_, Order>(&sql).fetch_all(&pool).await?;
```

**Correct:**

```rust
let rows = sqlx::query_as!(Order, "SELECT id, total FROM orders WHERE status = $1", status)
    .fetch_all(&pool)
    .await?;
```

Reference: https://docs.rs/sqlx/latest/sqlx/macro.query.html
