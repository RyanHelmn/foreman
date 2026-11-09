---
id: electron-isolation-on
title: Keep contextIsolation and sandbox on and nodeIntegration off in every BrowserWindow
impact: CRITICAL
impactDescription: "one XSS or one remote script in the renderer runs shell commands on the user's machine"
roles: [implementer, reviewer, security]
check: "rg -n 'nodeIntegration:\s*true|contextIsolation:\s*false|sandbox:\s*false|webSecurity:\s*false'"
tags: electron, isolation
---
Source: any script in the renderer (injected markup, a compromised dependency, remote content). Sink: Node APIs (`child_process`, `fs`) reachable from it. Renderers get no Node: `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`, `webSecurity` left on. Privileged work goes through a preload that exposes narrow functions.

**Incorrect:**

```ts
new BrowserWindow({ webPreferences: { nodeIntegration: true, contextIsolation: false } })
```

**Correct:**

```ts
new BrowserWindow({
  webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: true, nodeIntegration: false },
})
```

Reference: https://www.electronjs.org/docs/latest/tutorial/security
