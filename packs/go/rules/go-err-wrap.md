---
id: go-err-wrap
title: Wrap returned errors with context using %w, and compare with errors.Is/As
impact: HIGH
impactDescription: "errors arrive as a bare `sql: no rows` with no call path, and sentinel checks silently stop matching"
roles: [implementer, reviewer]
check: "rg -n 'Errorf\\([^)]*%v[^)]*err\\)|err == |err\\.Error\\(\\) ==' --type go"
tags: go, errors
---
Return `fmt.Errorf("<what was being done>: %w", err)` so callers keep both the context and the chain. `%v` flattens the chain: `errors.Is(err, sql.ErrNoRows)` stops matching. Compare with `errors.Is`/`errors.As`, never `==` or string matching. Every returned `err` is checked; `_ =` on an error needs a reason the reader can see.

**Incorrect:**

```go
if err != nil {
	return fmt.Errorf("load user: %v", err)
}
if err == sql.ErrNoRows { ... }
```

**Correct:**

```go
if err != nil {
	return fmt.Errorf("load user %d: %w", id, err)
}
if errors.Is(err, sql.ErrNoRows) { ... }
```

Reference: https://go.dev/blog/go1.13-errors
