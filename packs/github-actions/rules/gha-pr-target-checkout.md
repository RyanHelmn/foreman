---
id: gha-pr-target-checkout
title: Never check out and run pull-request code in a pull_request_target or workflow_run job
impact: CRITICAL
impactDescription: "any fork PR runs its own code with the repo's secrets and a write token"
roles: [implementer, reviewer, security]
check: "rg -n -l 'pull_request_target|workflow_run' .github/workflows | xargs rg -n 'head\\.sha|head\\.ref|head_ref|refs/pull/'"
tags: github-actions, security
---
Source: the PR's code (a fork controls it). Sink: `npm install`, build or test scripts executed in a job that has secrets. `pull_request_target` and `workflow_run` run in the base repo's context with secrets and a write-capable `GITHUB_TOKEN`. Build and test PRs on `pull_request`, which has no secrets for forks. If a privileged job needs PR output (labels, comments), pass data as an artifact and treat it as untrusted.

**Incorrect:**

```yaml
on: pull_request_target
jobs:
  test:
    steps:
      - uses: actions/checkout@v4
        with: { ref: "${{ github.event.pull_request.head.sha }}" }
      - run: npm ci && npm test
        env: { DATABASE_URL: "${{ secrets.DATABASE_URL }}" }
```

**Correct:**

```yaml
on: pull_request
jobs:
  test:
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test
```
