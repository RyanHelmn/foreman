---
id: rs-async-no-blocking
title: No blocking or CPU-heavy work in async fns; use spawn_blocking or the tokio equivalent
impact: HIGH
impactDescription: "one blocking call stalls a runtime worker thread and every task scheduled on it"
roles: [implementer, reviewer]
check: "rg -n 'std::thread::sleep|std::fs::|reqwest::blocking' --type rust"
tags: rust, async, tokio
---
Inside `async fn`, `std::thread::sleep`, `std::fs`, `reqwest::blocking`, sync DB clients, password hashing and large (de)compression block the executor. Use `tokio::time::sleep`, `tokio::fs`, async clients, or move the work to `tokio::task::spawn_blocking`. Don't hold a `std::sync::Mutex` guard across `.await`.

**Incorrect:**

```rust
async fn register(Json(input): Json<NewUser>) -> Result<StatusCode, AppError> {
    let hash = argon2.hash_password(input.password.as_bytes(), &salt)?.to_string();
```

**Correct:**

```rust
async fn register(Json(input): Json<NewUser>) -> Result<StatusCode, AppError> {
    let hash = tokio::task::spawn_blocking(move || hash_password(&input.password)).await??;
```

Reference: https://docs.rs/tokio/latest/tokio/task/fn.spawn_blocking.html
