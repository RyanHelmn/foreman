# go · security
Applies when: go.mod present
Read order: go-sql-placeholders, go-exec-no-shell, go-html-template, go-crypto-rand, go-http-server-timeouts

## Also trace (no rule file yet)
- `filepath.Join(base, userPath)` then `os.Open`: `..` escapes base; check the cleaned path stays under base (or use `os.Root` on Go 1.24+).
- `tls.Config{InsecureSkipVerify: true}` outside tests.
- Request bodies decoded without `http.MaxBytesReader`.
- `json.Decoder` into a struct with server-owned fields (role, owner) from the request.

## Commands
- `govulncheck ./...` (reports only vulnerabilities in code paths actually called).
- `gosec ./...` only if configured in the project (golangci-lint `gosec` linter counts).
