# electron · implementer
Applies when: `electron` or `@tauri-apps/api` in package.json, `tauri` in Cargo.toml, or `tauri.conf.json` present
Read order: electron-isolation-on, electron-preload-narrow, electron-ipc-validate, electron-tauri-capabilities, electron-navigation-restrict, electron-csp, electron-update-signed

## Iron laws
- No renderer gets Node: `contextIsolation` and `sandbox` on, `nodeIntegration` off, for every window including dev tools and popups. Thinking "this window only loads our own HTML"? That is the bug.
- Every `ipcMain.handle` / `#[tauri::command]` validates sender and arguments. Thinking "only our renderer calls it"? That is the bug.

## Deviation rules
- A feature needing a new privileged action gets a new named preload function and IPC channel (or Tauri command plus capability entry), never a widened generic one.

## Output additions
- Privileged surface changed: new IPC channels, preload functions, Tauri commands or capability permissions, one line each.
- Process: main, preload or renderer for each file changed.

## Obstacles to report
- Main-process code is Node (or Rust for Tauri); renderer code is browser-only. An import that pulls `fs`, `electron` or `path` into renderer code fails at runtime under `sandbox`.
- `remote` module (`@electron/remote`) in existing code: don't extend it; report it.
