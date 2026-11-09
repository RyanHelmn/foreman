---
id: electron-csp
title: Ship a Content-Security-Policy without unsafe-eval or remote scripts
impact: HIGH
impactDescription: "injected markup runs script, turning any XSS into access to the preload API"
roles: [implementer, reviewer, security]
check: "rg -n 'unsafe-eval|script-src[^;]*\*'"
tags: electron, tauri, csp
---
Every renderer page has a CSP: a `<meta http-equiv="Content-Security-Policy">` in the HTML, or a header from `session.defaultSession.webRequest.onHeadersReceived` (Electron), or `app.security.csp` in `tauri.conf.json` (Tauri 2). Scripts come from the app only: no `'unsafe-eval'`, no `*` or remote hosts in `script-src`. Dev-server allowances stay out of production builds.

**Incorrect:**

```html
<meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval'">
```

**Correct:**

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; connect-src 'self' https://api.example.com">
```

Reference: https://www.electronjs.org/docs/latest/tutorial/security#7-define-a-content-security-policy
