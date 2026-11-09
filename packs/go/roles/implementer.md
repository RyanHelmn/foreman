# go · implementer
Applies when: go.mod present
Read order: go-sql-placeholders, go-exec-no-shell, go-html-template, go-crypto-rand, go-http-server-timeouts, go-ctx-propagate, go-goroutine-exit, go-err-wrap

## Iron laws
- Every goroutine you start can be stopped by its caller. Thinking "it finishes quickly"? That is the bug.

## Deviation rules
- Packages by domain (`billing`, `orders`), not by layer (`models`, `handlers`); no new package-level mutable state, pass dependencies in a struct.
- Define interfaces in the consuming package, small (one to three methods); return concrete types.
- Use the router (`net/http` mux, chi, echo, gin), SQL layer (`database/sql`, sqlx, pgx, sqlc, an ORM) and migration tool (goose, golang-migrate) the project already uses; auth and logging go in middleware.
- Log with the project's structured logger (`log/slog` or its equivalent), not `fmt.Println`/`log.Printf`.
- sqlc projects: edit the `.sql` query file and regenerate with `sqlc generate`; never hand-edit generated code.
- Tests are table-driven with `t.Run(tc.name, ...)` where cases share a shape.

## Output additions
- Generated code regenerated (sqlc, mockgen, protoc): yes/no/not needed.

## Obstacles to report
- `go.mod` `go` directive below 1.22: loop variables are shared across iterations; say so if you capture them in closures.
