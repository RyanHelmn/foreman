# electron · security
Applies when: `electron` or `@tauri-apps/api` in package.json, `tauri` in Cargo.toml, or `tauri.conf.json` present
Read order: electron-isolation-on, electron-preload-narrow, electron-ipc-validate, electron-tauri-capabilities, electron-navigation-restrict, electron-csp, electron-update-signed

## Also trace (no rule file yet)
- `<webview>` tags and `BrowserView`/`WebContentsView` loading remote content: their own `webPreferences` and `will-attach-webview` handler.
- Custom protocol handlers (`protocol.handle`, `registerFileProtocol`) resolving request paths: path traversal out of the app directory.
- Deep links (`setAsDefaultProtocolClient`, `open-url`, `second-instance` argv): arguments parsed and validated, no sensitive action on open.
- `session.setPermissionRequestHandler` absent: remote pages get camera, mic and notifications by default.
- Electron fuses (`RunAsNode`, `EnableNodeCliInspectArguments`) left on in packaged builds, and secrets in `app.asar`, which is a readable archive.
- Electron version: renderers inherit Chromium bugs; a major version far behind current supported releases is a finding.

## Commands
- `npm audit --omit=dev` when package.json or the lockfile changed; `cargo audit` in `src-tauri` when Cargo.lock changed and the tool is installed.
