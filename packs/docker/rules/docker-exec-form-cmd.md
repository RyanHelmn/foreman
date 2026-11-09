---
id: docker-exec-form-cmd
title: Start the process with exec-form CMD so it receives SIGTERM
impact: HIGH
impactDescription: "the app never sees SIGTERM, is SIGKILLed after the grace period, and every deploy drops in-flight requests"
roles: [implementer, reviewer]
check: "rg -n -e '^(CMD|ENTRYPOINT)\\s+[^\\[]' -e 'CMD \\[\"npm\"' -g '*Dockerfile*'"
tags: docker, lifecycle
---
Shell-form `CMD node app.js` runs under `/bin/sh -c`, which is PID 1 and does not forward signals. `npm start` as PID 1 has the same problem. Use exec form invoking the runtime directly; an entrypoint script must end with `exec "$@"`. The app still needs its own SIGTERM handler.

**Incorrect:**

```dockerfile
CMD npm run start
```

**Correct:**

```dockerfile
CMD ["node", "dist/main.js"]
```
