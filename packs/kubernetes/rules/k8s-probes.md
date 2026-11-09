---
id: k8s-probes
title: Separate readiness and liveness probes; liveness never checks dependencies
impact: HIGH
impactDescription: "a database blip fails liveness on every pod at once and Kubernetes restarts the whole service"
roles: [implementer, reviewer]
tags: kubernetes, deploy
---
Readiness says "send me traffic" and may check the database; failing it only removes the pod from the Service. Liveness says "this process is wedged" and checks only the process itself; failing it restarts the pod. Slow starters get a `startupProbe` instead of a long `initialDelaySeconds`.

**Incorrect:**

```yaml
livenessProbe:
  httpGet: { path: /health/db, port: 3000 }
```

**Correct:**

```yaml
readinessProbe:
  httpGet: { path: /health/ready, port: 3000 }
livenessProbe:
  httpGet: { path: /health/live, port: 3000 }
startupProbe:
  httpGet: { path: /health/live, port: 3000 }
  failureThreshold: 30
  periodSeconds: 2
```
