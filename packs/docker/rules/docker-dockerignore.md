---
id: docker-dockerignore
title: A .dockerignore excludes .env, .git and node_modules before any COPY . .
impact: HIGH
impactDescription: "local .env secrets and git history are baked into the image, and every build invalidates the cache"
roles: [implementer, reviewer, security]
tags: docker, secrets
---
`COPY . .` copies the whole build context. Without `.dockerignore` that includes `.env*`, `.git`, host `node_modules` (wrong platform binaries) and test fixtures. A diff that adds `COPY . .` or a new secrets file checks the ignore file covers it.

**Incorrect (no .dockerignore):**

```dockerfile
COPY . .
RUN npm ci && npm run build
```

**Correct (.dockerignore):**

```gitignore
.git
.env*
!.env.example
node_modules
dist
coverage
```
