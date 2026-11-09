---
id: electron-preload-narrow
title: Expose named functions through contextBridge, never ipcRenderer or Node modules
impact: CRITICAL
impactDescription: "renderer code can invoke every IPC channel, including ones meant for privileged internal use"
roles: [implementer, reviewer, security]
check: "rg -n 'ipcRenderer\s*[,}]|ipcRenderer\.(invoke|send|on)\(\s*[a-z]' --glob '*preload*'"
tags: electron, ipc, preload
---
Source: renderer script. Sink: whatever the preload hands it. Exposing `ipcRenderer` itself, or a generic `invoke(channel, …args)`, lets the page call any channel and listen to any event. Expose one function per action, with fixed channel names.

**Incorrect (`preload.ts`):**

```ts
contextBridge.exposeInMainWorld('api', { invoke: (ch: string, ...a: unknown[]) => ipcRenderer.invoke(ch, ...a), ipcRenderer })
```

**Correct:**

```ts
contextBridge.exposeInMainWorld('api', {
  saveNote: (id: string, body: string) => ipcRenderer.invoke('notes:save', id, body),
})
```

Reference: https://www.electronjs.org/docs/latest/tutorial/context-isolation
