---
id: gha-frozen-install
title: CI installs from the lockfile and caches on its hash
impact: MEDIUM
impactDescription: "CI resolves different versions than were reviewed, and the cache restores stale dependencies after the lockfile changes"
roles: [implementer, reviewer]
check: "rg -n -e 'npm install\\b' -e 'pnpm install\\s*$' -e 'yarn install\\s*$' .github/workflows"
tags: github-actions, ci
---
Install with `npm ci`, `pnpm install --frozen-lockfile`, `yarn install --immutable` (Yarn 2+) or `--frozen-lockfile` (Yarn 1). Cache with `actions/setup-node`'s `cache:` input, or an `actions/cache` key containing `hashFiles('**/<lockfile>')`.

**Incorrect:**

```yaml
- uses: actions/cache@v4
  with: { path: ~/.npm, key: npm-cache }
- run: npm install
```

**Correct:**

```yaml
- uses: actions/setup-node@v4
  with: { node-version-file: .nvmrc, cache: npm }
- run: npm ci
```
