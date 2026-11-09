---
id: rs-no-unwrap
title: No unwrap() or expect() on fallible values in request or job paths
impact: HIGH
impactDescription: "one malformed input panics the handler task, dropping the request, or kills the process with panic = \"abort\""
roles: [implementer, reviewer]
check: "rg -n '\\.unwrap\\(\\)|\\.expect\\(' --type rust -g '!tests/**' -g '!benches/**' -g '!examples/**'"
tags: rust, errors
---
Propagate with `?` into the function's error type, or handle the `None`/`Err` case. `unwrap`/`expect` are fine in tests, in `main` setup before serving, and on invariants the code just established (state it in the `expect` message). `clippy::unwrap_used` and `clippy::expect_used` can enforce this per crate.

**Incorrect:**

```rust
async fn get_order(Path(id): Path<String>, State(db): State<PgPool>) -> Json<Order> {
    let id: i64 = id.parse().unwrap();
    Json(find_order(&db, id).await.unwrap())
}
```

**Correct:**

```rust
async fn get_order(Path(id): Path<i64>, State(db): State<PgPool>) -> Result<Json<Order>, AppError> {
    let order = find_order(&db, id).await?.ok_or(AppError::NotFound)?;
    Ok(Json(order))
}
```
