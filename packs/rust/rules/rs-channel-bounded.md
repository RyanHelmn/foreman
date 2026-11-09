---
id: rs-channel-bounded
title: Use bounded channels between tasks
impact: MEDIUM
impactDescription: "a slow consumer lets the queue grow until the process is OOM-killed"
roles: [implementer, reviewer]
check: "rg -n 'unbounded_channel|unbounded\\(\\)' --type rust"
tags: rust, async, tokio
---
`tokio::sync::mpsc::unbounded_channel` (and `crossbeam`/`flume` `unbounded`) never applies backpressure. Use `mpsc::channel(n)` with a capacity sized to the burst you accept; `send().await` waits when full, `try_send` lets the producer shed load.

**Incorrect:**

```rust
let (tx, rx) = tokio::sync::mpsc::unbounded_channel::<Event>();
```

**Correct:**

```rust
let (tx, rx) = tokio::sync::mpsc::channel::<Event>(1024);
```

Reference: https://docs.rs/tokio/latest/tokio/sync/mpsc/index.html
