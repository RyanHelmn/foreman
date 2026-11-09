---
id: k8s-graceful-termination
title: Give pods a preStop delay and a grace period longer than the app's drain time
impact: MEDIUM
impactDescription: "the pod gets SIGTERM while still listed in Service endpoints, so requests during every rollout hit a closing server"
roles: [implementer, reviewer]
tags: kubernetes, lifecycle
---
Endpoint removal and SIGTERM happen concurrently. A short `preStop` sleep keeps the pod serving until load balancers stop routing to it; `terminationGracePeriodSeconds` must exceed preStop plus the app's own drain time, or the kubelet SIGKILLs mid-drain. The `sleep` handler needs Kubernetes 1.30+; older clusters use `exec: { command: ["sleep", "10"] }`, which needs a `sleep` binary in the image.

**Incorrect:**

```yaml
spec:
  containers:
    - name: api
      image: registry.example.com/api:1.4.2
```

**Correct:**

```yaml
spec:
  terminationGracePeriodSeconds: 45
  containers:
    - name: api
      image: registry.example.com/api:1.4.2
      lifecycle:
        preStop:
          sleep: { seconds: 10 }
```
