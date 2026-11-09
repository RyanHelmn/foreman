---
id: rs-error-types
title: thiserror enums for library and domain errors, anyhow only at the binary edge
impact: MEDIUM
impactDescription: "callers can't match on failure cases and map them to status codes; context is lost"
roles: [implementer, reviewer]
check: "rg -n 'Box<dyn (std::error::)?Error|Result<[^>]*, String>' --type rust"
tags: rust, errors
---
Library crates and domain modules return a `#[derive(thiserror::Error)]` enum whose variants callers can match; `#[from]` for wrapped sources. `anyhow::Result` with `.context("...")` belongs in `main`, CLI commands and scripts. No `Result<T, String>` or `Box<dyn Error>` in public APIs. Web handlers map the domain enum to responses in one `IntoResponse`/`ResponseError` impl.

**Incorrect:**

```rust
pub fn parse_invoice(raw: &str) -> Result<Invoice, String> {
    serde_json::from_str(raw).map_err(|e| e.to_string())
}
```

**Correct:**

```rust
#[derive(Debug, thiserror::Error)]
pub enum InvoiceError {
    #[error("invalid invoice json")]
    Json(#[from] serde_json::Error),
}

pub fn parse_invoice(raw: &str) -> Result<Invoice, InvoiceError> {
    Ok(serde_json::from_str(raw)?)
}
```

Reference: https://docs.rs/thiserror
