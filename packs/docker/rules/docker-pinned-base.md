---
id: docker-pinned-base
title: Pin base images to a version tag or digest, never latest or a bare name
impact: MEDIUM
impactDescription: "a rebuild of the same commit silently gets a new major runtime and breaks in production"
roles: [implementer, reviewer]
check: "rg -n -e '^FROM\\s+[^:@\\s]+(\\s|$)' -e '^FROM\\s+\\S+:latest' -g '*Dockerfile*'"
tags: docker
---
Use at least a major+variant tag (`node:22-bookworm-slim`), or a digest (`@sha256:…`) where reproducibility matters. The same applies to compose `image:` for services the app depends on.

**Incorrect:**

```dockerfile
FROM node
FROM postgres:latest
```

**Correct:**

```dockerfile
FROM node:22.11-bookworm-slim
FROM postgres:16.4
```
