---
id: electron-navigation-restrict
title: Block navigation and new windows to other origins; open links with an https-only openExternal
impact: HIGH
impactDescription: "a link loads a hostile page inside the app, or launches a file:// or smb:// executable"
roles: [implementer, reviewer, security]
check: "rg -n 'shell\.openExternal\('"
tags: electron, navigation
---
Source: a link or `window.open` in rendered content. Sinks: in-app navigation (the page inherits the preload API) and `shell.openExternal` (runs the OS handler for any protocol). Deny `will-navigate` to other origins and `setWindowOpenHandler` by default. Pass only `https:` URLs (or an allowlist) to `shell.openExternal`.

**Incorrect:**

```ts
win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' } })
```

**Correct:**

```ts
win.webContents.on('will-navigate', (e, url) => { if (new URL(url).origin !== APP_ORIGIN) e.preventDefault() })
win.webContents.setWindowOpenHandler(({ url }) => {
  if (new URL(url).protocol === 'https:') shell.openExternal(url)
  return { action: 'deny' }
})
```

Reference: https://www.electronjs.org/docs/latest/tutorial/security#13-disable-or-limit-navigation
