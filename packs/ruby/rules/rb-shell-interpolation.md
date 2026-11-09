---
id: rb-shell-interpolation
title: Run commands with argument lists, never an interpolated string
impact: CRITICAL
impactDescription: "shell injection from any value interpolated into backticks, %x, system or open"
roles: [implementer, reviewer, security]
check: "rg -n '`[^`]*#\\{|%x[\\(\\{\\[].*#\\{|(system|exec|spawn|popen|capture2e?|capture3)\\(\\s*\"[^\"]*#\\{' --type ruby"
tags: shell, injection
---
Source: any request or job value. Sink: backticks, `%x()`, `system`/`exec`/`spawn`/`Open3.*` with a single interpolated string (passed to `/bin/sh`), and `Kernel#open`/`IO.read` on a value that may start with `|`. Pass the program and each argument separately so no shell parses them; read files with `File.open`, fetch URLs with `URI.open` only on a validated `URI::HTTPS`.

**Incorrect:**

```ruby
`convert #{params[:file]} out.png`
system("git clone #{repo_url} /tmp/repo")
open(params[:path]).read
```

**Correct:**

```ruby
system("convert", safe_path(params[:file]), "out.png", exception: true)
out, status = Open3.capture2e("git", "clone", "--", repo_url, "/tmp/repo")
File.open(safe_path(params[:path])).read
```

