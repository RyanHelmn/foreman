---
id: go-goroutine-exit
title: Every goroutine has an exit path the caller controls
impact: HIGH
impactDescription: "blocked goroutines pile up per request until the process runs out of memory"
roles: [implementer, reviewer]
tags: go, concurrency
---
A goroutine that sends on an unbuffered channel nobody reads after a timeout, or loops without watching `ctx.Done()`, never exits. Give result channels a buffer of one, select on `ctx.Done()` in loops, and bound fan-out with `errgroup.Group.SetLimit` or a semaphore. Errors from goroutines are collected (errgroup), not dropped.

**Incorrect (on timeout the sender blocks forever):**

```go
ch := make(chan result)
go func() { ch <- fetch(ctx, id) }()
select {
case r := <-ch:
	return r, nil
case <-time.After(2 * time.Second):
	return result{}, errTimeout
}
```

**Correct:**

```go
ch := make(chan result, 1)
go func() { ch <- fetch(ctx, id) }()
select {
case r := <-ch:
	return r, nil
case <-ctx.Done():
	return result{}, ctx.Err()
}
```

Reference: https://pkg.go.dev/golang.org/x/sync/errgroup
