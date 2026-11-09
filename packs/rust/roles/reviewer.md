# rust · reviewer
Applies when: Cargo.toml present
Read order: rs-sqlx-bind, rs-serde-input-struct, rs-no-unwrap, rs-unsafe-safety-comment, rs-async-no-blocking, rs-channel-bounded, rs-error-types

## Blocker vs should-fix
- Blocker: formatted SQL; a DB row struct used as a write extractor; `unsafe` without a `SAFETY` comment or without a need safe Rust can't meet; `unwrap`/`expect` on input-derived values in a handler.
- Should-fix: blocking calls in async fns; `std::sync::Mutex` guard held across `.await`; unbounded channels; `String`/`Box<dyn Error>` errors in a library API.
- Nit: anything `cargo fmt` or clippy would change.
