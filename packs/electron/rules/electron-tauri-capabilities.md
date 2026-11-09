---
id: electron-tauri-capabilities
title: Grant Tauri capabilities per window with scoped permissions
impact: CRITICAL
impactDescription: "the webview can read any file or spawn any program the user can"
roles: [implementer, reviewer, security]
check: "rg -n 'shell:allow-execute|fs:default|\"windows\":\s*\[\"\*\"\]' src-tauri/capabilities"
tags: tauri, isolation
---
Source: script in the Tauri webview. Sink: plugin commands (`fs`, `shell`, `http`) allowed by `src-tauri/capabilities/*.json`. Each capability names the windows it applies to and only the commands they call, with `fs` paths scoped to app directories and `shell` commands listed with fixed arguments. Custom `#[tauri::command]` handlers validate their arguments like any IPC handler.

**Incorrect:**

```json
{ "identifier": "default", "windows": ["*"], "permissions": ["core:default", "fs:default", "fs:allow-read-text-file", "shell:allow-execute"] }
```

**Correct:**

```json
{ "identifier": "main", "windows": ["main"],
  "permissions": ["core:default", { "identifier": "fs:allow-read-text-file", "allow": [{ "path": "$APPDATA/notes/**" }] }] }
```

Reference: https://v2.tauri.app/security/capabilities/
