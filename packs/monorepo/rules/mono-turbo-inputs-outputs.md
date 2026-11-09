---
id: mono-turbo-inputs-outputs
title: Declare outputs, env and dependsOn for every cached task
impact: HIGH
impactDescription: "a cache hit restores no build output, or replays a stale result after an env var or upstream package changed"
roles: [implementer, reviewer, verifier]
tags: monorepo, turborepo, nx
---
In `turbo.json` (`tasks` in Turbo 2, `pipeline` in 1.x) every build task lists its `outputs`, the env vars that change its result in `env`, and `dependsOn: ["^build"]` so dependencies build first. Nx's equivalent is `outputs`, `inputs` and `dependsOn` in `nx.json` `targetDefaults` or `project.json`. A new build step or env var in a diff needs the matching entry.

**Incorrect:**

```json
{ "tasks": { "build": {} } }
```

**Correct:**

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"],
      "env": ["NEXT_PUBLIC_API_URL"]
    },
    "test": { "dependsOn": ["^build"] }
  }
}
```
