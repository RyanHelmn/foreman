---
id: py-deps-locked
title: Change dependencies in pyproject.toml and the lockfile together
impact: MEDIUM
impactDescription: "CI and production install different versions than the one tested"
roles: [implementer, reviewer]
tags: packaging, python
---
The project's lock tool (`uv.lock`, `poetry.lock`, `pdm.lock`, `Pipfile.lock`, or pip-tools `requirements.txt` compiled from `requirements.in`) is the source of installed versions. A diff that adds or bumps a dependency in `pyproject.toml` or `requirements.in` without the matching lockfile change is incomplete. Never hand-edit the lockfile; regenerate it with the project's tool (`uv lock`, `poetry lock`, `pip-compile`).

**Incorrect (diff touches only the manifest):**

```toml
# pyproject.toml
dependencies = ["httpx>=0.27", "stripe"]
```

**Correct (manifest and lockfile change together, version bounded):**

```toml
# pyproject.toml (+ regenerated uv.lock in the same diff)
dependencies = ["httpx>=0.27", "stripe>=10,<11"]
```
