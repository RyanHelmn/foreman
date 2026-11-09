# go · reviewer
Applies when: go.mod present
Read order: go-sql-placeholders, go-exec-no-shell, go-html-template, go-crypto-rand, go-http-server-timeouts, go-ctx-propagate, go-goroutine-exit, go-err-wrap

## Blocker vs should-fix
- Blocker: any CRITICAL go rule; a goroutine with no exit path on a request path; an unchecked error from a write, commit or close of a written file.
- Should-fix: `context.Background()` in a request path; `%v` on a wrapped error; a new package-level `var` holding state; an interface declared next to its only implementation; `defer` inside a loop holding files or rows until the function returns.
- Nit: unformatted code (`gofmt` would change it).
