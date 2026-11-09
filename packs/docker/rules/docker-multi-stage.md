---
id: docker-multi-stage
title: Build in one stage and copy only runtime artifacts into the final stage
impact: MEDIUM
impactDescription: "the image ships compilers, dev dependencies and source: several times larger and with more CVEs"
roles: [implementer, reviewer]
tags: docker
---
The build stage installs all dependencies and compiles; the final stage starts from a slim base, installs production dependencies only (or copies a pruned `node_modules`), and copies the build output. Copy the lockfile and install before copying source so dependency layers cache.

**Incorrect:**

```dockerfile
FROM node:22-bookworm
COPY . .
RUN npm install && npm run build
CMD ["node", "dist/main.js"]
```

**Correct:**

```dockerfile
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
USER node
CMD ["node", "dist/main.js"]
```
