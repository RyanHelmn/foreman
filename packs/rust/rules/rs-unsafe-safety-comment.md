---
id: rs-unsafe-safety-comment
title: Every unsafe block carries a // SAFETY: comment stating the invariant it relies on
impact: HIGH
impactDescription: "undefined behaviour (use-after-free, data races, out-of-bounds) that the compiler no longer guards"
roles: [implementer, reviewer, security]
check: "rg -n -B2 'unsafe \\{' --type rust"
tags: security, rust, unsafe
---
`unsafe` is allowed only where safe Rust can't express the operation (FFI, a measured hot path) and must be reviewed as a security change. The block is minimal and preceded by `// SAFETY:` naming the invariant that makes it sound and why it holds here. `clippy::undocumented_unsafe_blocks` enforces the comment; `#![forbid(unsafe_code)]` in crates that need none.

**Incorrect:**

```rust
let s = unsafe { std::str::from_utf8_unchecked(&buf[..n]) };
```

**Correct:**

```rust
let s = std::str::from_utf8(&buf[..n])?;
```

```rust
// SAFETY: `ptr` came from `Box::into_raw` in `register` and is freed only here, once.
let cb = unsafe { Box::from_raw(ptr) };
```

Reference: https://doc.rust-lang.org/nomicon/
