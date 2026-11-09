---
id: k8s-resources
title: Every container sets CPU and memory requests and a memory limit
impact: HIGH
impactDescription: "one leaking pod starves its neighbours on the node, and the scheduler packs pods with no idea of their size"
roles: [implementer, reviewer]
tags: kubernetes, deploy
---
Set `resources.requests` for CPU and memory and `resources.limits.memory`. For Node, keep the V8 heap under the limit (`--max-old-space-size` around 75% of it) so the process garbage-collects before the kernel OOM-kills it.

**Incorrect:**

```yaml
containers:
  - name: api
    image: registry.example.com/api:1.4.2
```

**Correct:**

```yaml
containers:
  - name: api
    image: registry.example.com/api:1.4.2
    resources:
      requests: { cpu: 250m, memory: 512Mi }
      limits: { memory: 512Mi }
    env:
      - { name: NODE_OPTIONS, value: "--max-old-space-size=384" }
```
