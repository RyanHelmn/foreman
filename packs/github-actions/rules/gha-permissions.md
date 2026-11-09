---
id: gha-permissions
title: Set permissions to read at the top of every workflow and widen per job
impact: HIGH
impactDescription: "a compromised step or action gets a token that can push to main, publish releases or edit workflows"
roles: [implementer, reviewer, security]
check: "rg --files-without-match '^permissions:' .github/workflows"
tags: github-actions, security
---
Without a `permissions:` key the `GITHUB_TOKEN` gets the repository default, which on older repos is read/write on everything. Declare `contents: read` at workflow level and grant `pull-requests: write`, `id-token: write`, `packages: write` only on the job that needs it.

**Incorrect:**

```yaml
on: push
jobs:
  release: …
  test: …
```

**Correct:**

```yaml
on: push
permissions:
  contents: read
jobs:
  release:
    permissions:
      contents: write
  test: …
```
