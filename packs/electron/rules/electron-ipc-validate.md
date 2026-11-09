---
id: electron-ipc-validate
title: Validate the sender and every argument in ipcMain handlers
impact: CRITICAL
impactDescription: "a renderer reads or writes any file, or runs any command, through a handler that trusts its arguments"
roles: [implementer, reviewer, security]
tags: electron, ipc
---
Source: arguments from `ipcRenderer.invoke`, controlled by whatever runs in the renderer. Sink: `fs`, `child_process`, `shell`, network or database calls in the main process. Check `event.senderFrame` is your app's origin, parse arguments with a schema, and resolve paths inside an allowed directory. Never accept a raw path, command or URL to act on.

**Incorrect:**

```ts
ipcMain.handle('file:read', (_e, filePath: string) => fs.readFile(filePath, 'utf8'))
```

**Correct:**

```ts
ipcMain.handle('notes:read', (e, id: unknown) => {
  if (new URL(e.senderFrame!.url).origin !== APP_ORIGIN) throw new Error('forbidden')
  const noteId = z.string().uuid().parse(id)
  return fs.readFile(path.join(notesDir, `${noteId}.md`), 'utf8')
})
```

Reference: https://www.electronjs.org/docs/latest/tutorial/security#17-validate-the-sender-of-all-ipc-messages
