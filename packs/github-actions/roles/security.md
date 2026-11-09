# github-actions · security
Applies when: .github/workflows or an action.yml is present
Read order: gha-pr-target-checkout, gha-script-injection, gha-permissions, gha-pin-sha

## Also trace (no rule file yet)
- Untrusted values written to `$GITHUB_ENV`, `$GITHUB_OUTPUT` or `$GITHUB_PATH`: they become env vars or PATH entries for later steps.
- Artifacts or caches produced by a fork PR job and consumed by a `workflow_run` job with secrets (artifact or cache poisoning).
- `secrets: inherit` to a reusable workflow that doesn't need them all.
- `id-token: write` with a cloud role whose trust policy doesn't restrict the `sub` claim to this repo and branch or environment.
- Self-hosted runners on a public repository's PR workflows.
- `issue_comment` triggers that run commands (`/deploy`) without checking `github.event.comment.author_association`.

## Commands
- If installed: `zizmor .github/workflows` (Actions security audit), `actionlint` (includes injection checks and shellcheck on `run:`).
