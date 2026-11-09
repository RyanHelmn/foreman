# kubernetes · security
Applies when: Kubernetes manifests, Helm charts, Kustomize or Skaffold files are present
Read order: k8s-security-context

## Also trace (no rule file yet)
- ServiceAccounts: `automountServiceAccountToken` left on for pods that never call the API; Roles granting `secrets` get/list or `*` verbs.
- Services of type `LoadBalancer`/`NodePort` or Ingress routes exposing admin UIs, metrics or internal APIs.
- A namespace with no NetworkPolicy where the change adds a database or internal service.

## Commands
- If installed: `trivy config .` or `kube-score score <manifests>`; for charts render first with `helm template <chart>`.
