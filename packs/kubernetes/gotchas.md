# kubernetes gotchas

- [gotcha] A migration Job or Helm pre-upgrade hook runs before the new pods but while old pods still serve; migrations must be backward compatible with the running version · paths: **/templates/**
- [gotcha] Changing a ConfigMap or Secret does not restart pods that read it as env vars; roll the Deployment or hash the config into a pod annotation · paths: **/templates/**
