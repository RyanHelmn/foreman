# electron gotchas
- [gotcha] With sandbox on (the default since Electron 20), preload scripts can only require a small set of modules (electron renderer APIs, events, timers, url); bundle anything else or move it to main · paths: **/preload*
- [gotcha] Tauri 2 moved the CSP to app.security.csp and permissions to src-tauri/capabilities/*.json; v1 allowlist config is ignored · paths: **/tauri.conf.json
