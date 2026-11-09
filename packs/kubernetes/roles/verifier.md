# kubernetes · verifier
Applies when: Kubernetes manifests, Helm charts, Kustomize or Skaffold files are present

## Commands
- Helm: `helm lint <chart>` and `helm template <chart> -f <values>` to render.
- Kustomize: `kubectl kustomize <dir>` to render.
- Schema: if installed, pipe rendered output to `kubeconform -strict -summary`. With a cluster context: `kubectl apply --dry-run=server -f <file>`.

## Known false negatives
- kubeconform with `-ignore-missing-schemas` checks nothing for CRDs, and it never checks admission policies; only `--dry-run=server` does. No cluster and no kubeconform: INCONCLUSIVE.
- `helm lint` passes templates that render to invalid manifests for non-default values; render with the values the diff changed.
