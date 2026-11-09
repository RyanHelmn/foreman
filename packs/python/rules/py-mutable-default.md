---
id: py-mutable-default
title: No mutable or call-time-dependent default arguments
impact: MEDIUM
impactDescription: "state leaks between calls and requests; a `datetime.now()` default is frozen at import time"
roles: [implementer, reviewer]
check: "rg -n 'def .*=\\s*(\\[\\]|\\{\\}|set\\(\\)|datetime\\.now\\(\\))' --type py"
tags: python
---
Defaults are evaluated once, when `def` runs. A list, dict or set default is shared by every call; a `datetime.now()` or `uuid4()` default is the same value forever. Default to `None` and build inside, or use `field(default_factory=...)` in dataclasses and Pydantic. Ruff `B006`/`B008` flag both.

**Incorrect:**

```python
def add_tag(tag: str, tags: list[str] = []) -> list[str]:
    tags.append(tag)
    return tags
```

**Correct:**

```python
def add_tag(tag: str, tags: list[str] | None = None) -> list[str]:
    return [*(tags or []), tag]
```
