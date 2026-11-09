---
id: docker-migrate-release-step
title: Run database migrations as a release step, not in the container start command
impact: HIGH
impactDescription: "N replicas start, race the same migration, and a failed migration crash-loops every instance"
roles: [implementer, reviewer]
check: "rg -n -e 'migrate.*&&' -g '*Dockerfile*' -g '*compose*.y*ml'"
tags: docker, deploy
---
Migrations run once per deploy, before the new version takes traffic: a pre-deploy command (Coolify, Render, Fly `release_command`), a Kubernetes Job or Helm hook, or a CI step. The container command starts only the app. Migrations stay backward compatible with the running version (expand, deploy, contract).

**Incorrect:**

```dockerfile
CMD ["sh", "-c", "npm run migrate && node dist/main.js"]
```

**Correct:**

```dockerfile
CMD ["node", "dist/main.js"]
```

```yaml
# deploy pipeline, before rollout
- run: docker run --rm --env-file prod.env app:${SHA} node dist/migrate.js
```
