# go · verifier
Applies when: go.mod present

## Commands
- Subset: `go test ./internal/billing/... -run 'TestRefund$'` (`-run 'TestRefund/closed_order'` for one table case).
- Full: `go test -race ./...` (race detector needs cgo; if unavailable report it, don't drop `-race` silently).
- Vet: `go vet ./...`; lint: `golangci-lint run ./...` only if `.golangci.yml`/`.golangci.yaml` exists.
- Format: `gofmt -l .` exits 0 even when files are unformatted; any output is a failure.

## Obstacles to report
- `-run` matching nothing prints `ok ... [no tests to run]` and exits 0: report it, not PASS.
- `(cached)` results come from an earlier run; add `-count=1` when tests depend on a database or files outside the package.
- Tests behind `//go:build integration` (or another tag) only run with `-tags integration`.
- The race detector only sees races that execute; a clean run is not proof.
