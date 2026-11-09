# rust · verifier
Applies when: Cargo.toml present

## Commands
- Subset: `cargo test refund` (substring filter on test path); one crate: `cargo test -p billing refund`; exact: `cargo test -p billing -- --exact orders::tests::refund_rejects_closed`.
- Full: `cargo test --workspace` (add `--all-features` if the project's CI does).
- Lint: `cargo clippy --all-targets -- -D warnings`; format: `cargo fmt --check`.
- sqlx offline cache: `cargo sqlx prepare --check` only if a `.sqlx/` directory exists.

## Obstacles to report
- A filter matching nothing prints `0 passed` and exits 0: report it, not PASS.
- `#[ignore]` tests are skipped; run `cargo test -- --ignored` if a changed test carries it.
- Code behind a cargo feature isn't compiled without that feature; a green run without it says nothing about that code.
- `query!` macros fail to compile without `DATABASE_URL` or `SQLX_OFFLINE=true` plus `.sqlx/`: INCONCLUSIVE, not FAILED.
