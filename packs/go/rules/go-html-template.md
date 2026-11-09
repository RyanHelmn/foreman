---
id: go-html-template
title: Render HTML with html/template, never text/template
impact: CRITICAL
impactDescription: "user text renders as script in the page (XSS)"
roles: [implementer, reviewer, security]
check: "rg -n '\"text/template\"|template\\.HTML\\(' --type go"
tags: security, go, xss
---
Source: any user-controlled value passed to a template. Sink: a template whose output is served as HTML. `html/template` escapes by context (HTML, attribute, JS, URL); `text/template` escapes nothing. Converting input to `template.HTML`, `template.JS` or `template.URL` disables escaping for that value.

**Incorrect:**

```go
import "text/template"

tmpl := template.Must(template.ParseFiles("profile.html"))
tmpl.Execute(w, map[string]any{"Bio": template.HTML(user.Bio)})
```

**Correct:**

```go
import "html/template"

tmpl := template.Must(template.ParseFiles("profile.html"))
tmpl.Execute(w, map[string]any{"Bio": user.Bio})
```

Reference: https://pkg.go.dev/html/template
