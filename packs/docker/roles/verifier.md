# docker · verifier
Applies when: a Dockerfile or compose file is present

## Commands
- Dockerfile changed: `docker build --check .` (lint only, no build), then `docker build -t foreman-verify .` in full mode. If installed, `hadolint Dockerfile`.
- Compose changed: `docker compose config -q` validates syntax and interpolation.

## Known false negatives
- A cached layer hides a step that no longer works from a clean state; full mode builds with `--no-cache` when a `RUN` line or base image changed.
- A built image says nothing about start-up: if a daemon is available, `docker run --rm` it and check it reaches the health endpoint or logs its listen line.
- No daemon or no network: INCONCLUSIVE, not PASSED.
