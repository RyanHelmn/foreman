# kubernetes · reviewer
Applies when: Kubernetes manifests, Helm charts, Kustomize or Skaffold files are present
Read order: k8s-security-context, k8s-probes, k8s-resources, k8s-graceful-termination

## Blocker vs should-fix
- Blocker: `privileged`, `hostPath`, `hostNetwork` or a root container in an application workload; a secret value committed in a manifest or values file; a liveness probe that checks the database.
- Should-fix: missing requests or memory limit; missing readiness probe; image tag `latest`; no preStop delay on a Service-backed workload.
