---
id: gha-pin-sha
title: Pin third-party actions to a full commit SHA with the version in a comment
impact: HIGH
impactDescription: "a moved tag on a compromised action runs new code in every workflow with access to its secrets"
roles: [implementer, reviewer, security]
check: "rg -n 'uses:\\s+[^.][^@]*@' .github/workflows | rg -v -e '@[0-9a-f]{40}' -e 'uses:\\s+(actions|github)/'"
tags: github-actions, supply-chain
---
Tags are mutable; a 40-character SHA is not. Actions outside GitHub's own `actions/` and `github/` orgs are pinned by SHA with `# vX.Y.Z` after it so update bots can bump them. Follow the repo's policy if it already pins first-party actions too. Never `@main`.

**Incorrect:**

```yaml
- uses: pnpm/action-setup@v4
- uses: some-org/deploy-action@main
```

**Correct:**

```yaml
- uses: pnpm/action-setup@<40-char SHA the v4.1.0 tag points to> # v4.1.0
```

Resolve the SHA with `git ls-remote https://github.com/pnpm/action-setup refs/tags/v4.1.0`; never write one from memory.
