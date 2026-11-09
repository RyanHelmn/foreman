# docker · reviewer
Applies when: a Dockerfile or compose file is present
Read order: docker-build-secret, docker-non-root, docker-dockerignore, docker-exec-form-cmd, docker-migrate-release-step, docker-pinned-base, docker-multi-stage

## Blocker vs should-fix
- Blocker: a secret in `ARG`, `ENV` or a copied file; a final stage running as root; migrations in the start command of a service with more than one replica.
- Should-fix: shell-form `CMD` or `npm start` as PID 1; unpinned or `latest` base; single-stage image with dev dependencies; no health check on a service the platform routes traffic to; no memory limit in the deploy config.
