# kubernetes · implementer
Applies when: Kubernetes manifests, Helm charts, Kustomize or Skaffold files are present
Read order: k8s-security-context, k8s-probes, k8s-resources, k8s-graceful-termination

## Deviation rules
- Migrations run as a Job or Helm `pre-install,pre-upgrade` hook, never in the app container's command or an init container on a multi-replica Deployment.
- Secrets come from a `Secret` (or External Secrets/Sealed Secrets, matching the repo); never inline values in a manifest or `values.yaml`.

## Output additions
- Workloads touched: kind/name, image tag, probes yes/no, resources yes/no.

## Obstacles to report
- The app has no separate readiness and liveness endpoints for the probes to call.
