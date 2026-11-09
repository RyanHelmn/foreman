# github-actions · reviewer
Applies when: .github/workflows or an action.yml is present
Read order: gha-pr-target-checkout, gha-script-injection, gha-permissions, gha-pin-sha, gha-pr-gates, gha-frozen-install

## Blocker vs should-fix
- Blocker: untrusted `${{ }}` in a script; PR code run in a privileged trigger; `permissions: write-all` or a new workflow with no `permissions:`; a third-party action at `@main`.
- Should-fix: a third-party action pinned by tag only; a non-frozen install; a cache key without the lockfile hash; integration tests skipped or mocked in CI.
