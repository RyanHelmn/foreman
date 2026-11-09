---
id: docker-non-root
title: The final stage runs as a non-root USER
impact: HIGH
impactDescription: "a code-execution bug in the app is root in the container, one kernel or mount bug from the host"
roles: [implementer, reviewer, security]
check: "rg --files-without-match '^USER\\s' -g '*Dockerfile*'"
tags: docker, security
---
Set `USER` in the final stage after copying files (official Node images ship a `node` user; otherwise create one). Files the app writes go to a directory that user owns; `COPY --chown` instead of a recursive `chown` layer. In compose and Kubernetes don't override it back to root or add `privileged: true`.

**Incorrect:**

```dockerfile
FROM node:22-bookworm-slim
WORKDIR /app
COPY --from=build /app/dist ./dist
CMD ["node", "dist/main.js"]
```

**Correct:**

```dockerfile
FROM node:22-bookworm-slim
WORKDIR /app
COPY --from=build --chown=node:node /app/dist ./dist
USER node
CMD ["node", "dist/main.js"]
```
