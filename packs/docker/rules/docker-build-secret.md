---
id: docker-build-secret
title: Pass build-time secrets with a secret mount, never ARG, ENV or COPY
impact: CRITICAL
impactDescription: "the token is readable by anyone who can pull the image, via docker history or a layer tarball"
roles: [implementer, reviewer, security]
check: "rg -n -i -e '^(ARG|ENV)\\s+\\w*(TOKEN|SECRET|PASSWORD|KEY)' -e '^COPY\\s+.*\\.env' -g '*Dockerfile*'"
tags: docker, secrets
---
`ARG` and `ENV` values are recorded in image metadata and layers; deleting a copied `.env` in a later layer leaves it in the earlier one. Use BuildKit `RUN --mount=type=secret` for build-time credentials (private registry tokens) and inject runtime secrets from the platform's secret store as env vars at run time.

**Incorrect:**

```dockerfile
ARG NPM_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc && npm ci
```

**Correct:**

```dockerfile
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci
```
