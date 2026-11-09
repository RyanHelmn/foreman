---
id: rs-serde-input-struct
title: Deserialize request bodies into input structs without server-owned fields, with deny_unknown_fields
impact: HIGH
impactDescription: "a client sets `role`, `owner_id` or `verified` by adding it to the JSON"
roles: [implementer, reviewer, security]
tags: security, rust, serde, mass-assignment
---
Source: the request body via `Json<T>`/`web::Json<T>`. Sink: an insert or update built from `T`. Reusing the DB row struct as the extractor type lets clients write every field. Give each write its own struct with only client-editable fields, add `#[serde(deny_unknown_fields)]` so stray keys are rejected rather than ignored, and set owner and status from the authenticated user.

**Incorrect:**

```rust
async fn create(State(db): State<PgPool>, Json(user): Json<User>) -> Result<Json<User>, AppError> {
    insert_user(&db, &user).await
}
```

**Correct:**

```rust
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct NewUser { email: String, name: String }

async fn create(State(db): State<PgPool>, Json(input): Json<NewUser>) -> Result<Json<UserOut>, AppError> {
    insert_user(&db, &input, Role::Member).await
}
```

Reference: https://serde.rs/container-attrs.html#deny_unknown_fields
