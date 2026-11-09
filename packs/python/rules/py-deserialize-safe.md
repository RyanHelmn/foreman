---
id: py-deserialize-safe
title: Never unpickle or yaml.load untrusted bytes; use json or yaml.safe_load
impact: CRITICAL
impactDescription: "a crafted payload executes code in the process (RCE)"
roles: [implementer, reviewer, security]
check: "rg -n 'pickle\\.loads?\\(|yaml\\.(unsafe_)?load\\(|marshal\\.loads|shelve\\.open' --type py"
tags: security, python
---
Source: request bodies, uploads, cache or queue values another service can write, cookies. Sink: `pickle.load(s)`, `yaml.load` with `Loader=yaml.Loader`/`UnsafeLoader`/`FullLoader`, `yaml.unsafe_load`, `marshal`, `shelve`. Pickle runs code by design; there is no safe way to unpickle data an attacker can influence. Use JSON or `yaml.safe_load`, then validate the result.

**Incorrect:**

```python
state = pickle.loads(base64.b64decode(request.cookies["state"]))
config = yaml.load(upload.read(), Loader=yaml.Loader)
```

**Correct:**

```python
state = State.model_validate_json(signer.unsign(request.cookies["state"]))
config = yaml.safe_load(upload.read())
```

Reference: https://docs.python.org/3/library/pickle.html
