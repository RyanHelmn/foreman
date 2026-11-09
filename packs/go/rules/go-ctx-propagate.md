---
id: go-ctx-propagate
title: Take ctx as the first parameter and pass the request's context down; no context.Background() in request paths
impact: HIGH
impactDescription: "cancelled requests keep running queries and calls; deadlines never reach the database"
roles: [implementer, reviewer]
check: "rg -n 'context\\.(Background|TODO)\\(\\)' --type go -g '!*_test.go' -g '!main.go'"
tags: go, context
---
Any function that does IO takes `ctx context.Context` as its first parameter and passes it on (`QueryContext`, `http.NewRequestWithContext`, `exec.CommandContext`). Handlers start from `r.Context()`. Add deadlines with `context.WithTimeout` and always `defer cancel()`. `context.Background()` belongs in `main`, tests and detached jobs only.

**Incorrect:**

```go
func (s *Store) Orders(userID int64) ([]Order, error) {
	rows, err := s.db.QueryContext(context.Background(), listOrders, userID)
```

**Correct:**

```go
func (s *Store) Orders(ctx context.Context, userID int64) ([]Order, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	rows, err := s.db.QueryContext(ctx, listOrders, userID)
```

Reference: https://pkg.go.dev/context
