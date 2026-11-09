# electron · reviewer
Applies when: `electron` or `@tauri-apps/api` in package.json, `tauri` in Cargo.toml, or `tauri.conf.json` present
Read order: electron-isolation-on, electron-preload-narrow, electron-ipc-validate, electron-tauri-capabilities, electron-navigation-restrict, electron-csp, electron-update-signed

## Blocker vs should-fix
- Blocker: any CRITICAL rule here; `shell.openExternal` on an unchecked URL; `'unsafe-eval'` added to the CSP; a custom update download.
- Should-fix: an IPC handler that does its work in the renderer's preload instead of main; long synchronous work in the main process (blocks every window); `ipcRenderer.sendSync`.
