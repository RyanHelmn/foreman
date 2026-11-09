# docker · implementer
Applies when: a Dockerfile or compose file is present
Read order: docker-build-secret, docker-non-root, docker-dockerignore, docker-exec-form-cmd, docker-migrate-release-step, docker-pinned-base, docker-multi-stage

## Deviation rules
- Compose files are for local dependencies (database, Redis, mail catcher); don't move production config or secrets into them.
- A new runtime env var goes in the platform's secret store or deploy config and `.env.example`, never into the Dockerfile.

## Output additions
- Image changes: base image, final USER, exposed port, start command.

## Obstacles to report
- No Docker daemon available to build the image: say the Dockerfile is unbuilt.
- A health-check endpoint the platform needs (Coolify, Kubernetes) does not exist in the app.
