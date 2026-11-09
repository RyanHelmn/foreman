---
id: electron-update-signed
title: Auto-update only through a signature-verifying updater over HTTPS
impact: HIGH
impactDescription: "whoever controls the update URL or network path installs code on every user's machine"
roles: [implementer, reviewer, security]
tags: electron, tauri, updates
---
Source: the update feed and downloaded installer. Sink: code executed on next launch. Use `electron-updater` or Electron's `autoUpdater` with code-signed builds (macOS signing and notarisation, Windows Authenticode), or Tauri's updater plugin with its `pubkey` set. Never download and spawn an installer yourself, and never serve the feed over HTTP.

**Incorrect:**

```ts
const file = await download(`http://updates.example.com/app-${latest}.exe`)
spawn(file, { detached: true })
```

**Correct:**

```ts
import { autoUpdater } from 'electron-updater'
autoUpdater.checkForUpdatesAndNotify() // feed from the publish config, builds signed in CI
```

Reference: https://www.electron.build/auto-update
