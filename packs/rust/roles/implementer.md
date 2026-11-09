# rust · implementer
Applies when: Cargo.toml present
Read order: rs-sqlx-bind, rs-serde-input-struct, rs-no-unwrap, rs-unsafe-safety-comment, rs-async-no-blocking, rs-channel-bounded, rs-error-types

## Iron laws
- No new `unsafe` unless the brief asks for it; if it does, every block has a `// SAFETY:` comment. Thinking "it's obviously sound"? That is the bug.

## Deviation rules
- Axum/Actix handlers take dependencies through typed state (`State<AppState>`, `web::Data<T>`) and typed extractors (`Path<i64>`, `Json<T>`), not by parsing strings by hand.
- Use the data layer the crate already uses (sqlx macros, sea-orm, diesel); don't mix in a second.
- sqlx `query!` macros need a database or the `.sqlx` offline cache: if you change a query and can't reach a database, say so; don't swap to the unchecked function form to get it compiling.

## Output additions
- `.sqlx` cache regenerated (`cargo sqlx prepare`): yes/no/not applicable.

## Obstacles to report
- Feature flags that gate the code you changed: name them, so the verifier builds with them.
