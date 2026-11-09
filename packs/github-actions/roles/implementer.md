# github-actions · implementer
Applies when: .github/workflows or an action.yml is present
Read order: gha-pr-target-checkout, gha-script-injection, gha-permissions, gha-pin-sha, gha-pr-gates, gha-frozen-install

## Iron laws
- No `${{ github.event.* }}` or `${{ github.head_ref }}` inside `run:` or `script:`. Thinking "it's only our own team's PR titles"? That is the bug.
- No PR head checkout in a `pull_request_target` or `workflow_run` job. Thinking "we need secrets to run the tests"? Then those tests don't run on fork PRs.

## Deviation rules
- A new action is a new dependency: it must be in the brief, pinned by SHA resolved with `git ls-remote`.
- Secrets go in `env:` on the step that uses them, not at workflow level.

## Output additions
- Workflows touched: triggers, permissions granted, new actions with their pinned SHA.

## Obstacles to report
- The change needs a new repository secret or variable: name it; it can't be created from the diff.
