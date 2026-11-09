# rust · security
Applies when: Cargo.toml present
Read order: rs-sqlx-bind, rs-serde-input-struct, rs-unsafe-safety-comment

## Also trace (no rule file yet)
- `reqwest` `danger_accept_invalid_certs(true)` outside tests.
- Paths joined from input (`PathBuf::join` with an absolute or `..` component replaces or escapes the base).
- `std::process::Command::new("sh").arg("-c")` with input.
- Tokens, ids and codes from a non-cryptographic RNG (`SmallRng`, `fastrand`) instead of `OsRng` or the default thread RNG.

## Commands
- `cargo audit` when `Cargo.toml` or `Cargo.lock` changed.
- `cargo deny check` only if `deny.toml` exists (also checks licences and banned crates).
