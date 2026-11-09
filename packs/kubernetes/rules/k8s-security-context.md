---
id: k8s-security-context
title: Every container sets runAsNonRoot, no privilege escalation and dropped capabilities
impact: HIGH
impactDescription: "a code-execution bug in the app runs as root with escalation available inside the node"
roles: [implementer, reviewer, security]
check: "rg -n -e 'privileged:\\s*true' -e 'allowPrivilegeEscalation:\\s*true' -e 'hostPath:' -e 'hostNetwork:\\s*true'"
tags: kubernetes, security
---
Each Deployment, StatefulSet, Job and CronJob container sets a `securityContext` with `runAsNonRoot: true`, `allowPrivilegeEscalation: false` and `capabilities.drop: ["ALL"]`, plus `readOnlyRootFilesystem: true` where the app writes only to mounted volumes. No `privileged`, `hostPath`, `hostNetwork` or `hostPID` for application workloads.

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
    securityContext:
      runAsNonRoot: true
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities: { drop: ["ALL"] }
```
