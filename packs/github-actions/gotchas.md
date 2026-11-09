# github-actions gotchas

- [gotcha] Workflows triggered by GITHUB_TOKEN (a push or PR made by a workflow) do not trigger other workflows; use a GitHub App token when a bot commit must run CI · paths: .github/workflows/**
- [gotcha] Required status checks on a workflow with `on: paths:` filters block PRs that touch none of those paths, because the check never reports · paths: .github/workflows/**
- [gotcha] pnpm/action-setup must run before actions/setup-node with `cache: pnpm`, or setup-node fails to find pnpm · paths: .github/workflows/**
