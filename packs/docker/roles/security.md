# docker · security
Applies when: a Dockerfile or compose file is present
Read order: docker-build-secret, docker-non-root, docker-dockerignore

## Also trace (no rule file yet)
- `/var/run/docker.sock` mounted into a container, `privileged: true`, `network_mode: host`, `cap_add`: container escape paths.
- Compose ports for databases and admin UIs published on `0.0.0.0` (`"5432:5432"`) on a server rather than `127.0.0.1:5432:5432`.
- Admin and debug UIs (Swagger, Bull Board, GraphiQL, Adminer) exposed by the image or compose without auth in production.

## Commands
- If an image can be built: `docker history --no-trunc <image>` shows build args and commands baked into layers.
- If installed: `docker scout cves <image>` or `trivy image <image>`; `trivy config .` for Dockerfile and compose misconfiguration.
