---
id: gha-pr-gates
title: Pull requests run typecheck, lint, unit and integration tests; integration uses a real database service
impact: MEDIUM
impactDescription: "a PR merges with a type error or a broken query that only mocks would have hidden"
roles: [implementer, reviewer]
tags: github-actions, ci
---
The `pull_request` workflow runs the same typecheck, lint and test commands developers run locally. Integration tests use a `services:` container (Postgres, Redis) rather than mocks. Slow e2e suites run on `push` to main or a `schedule`, not on every PR. Secrets come from `${{ secrets.* }}`, scoped to the step that needs them.

**Incorrect:**

```yaml
on: pull_request
jobs:
  test:
    steps:
      - run: npm test -- --testPathIgnorePatterns=integration
```

**Correct:**

```yaml
on: pull_request
jobs:
  test:
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: postgres }
        ports: ["5432:5432"]
        options: --health-cmd pg_isready --health-interval 5s --health-retries 10
    steps:
      - run: npm run typecheck && npm run lint && npm test
        env: { DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/postgres" }
```
