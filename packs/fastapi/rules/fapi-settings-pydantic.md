---
id: fapi-settings-pydantic
title: Read configuration through a pydantic-settings class injected as a dependency
impact: MEDIUM
impactDescription: "a missing variable surfaces as a 500 on the first request instead of failing boot, and tests can't override it"
roles: [implementer, reviewer]
check: "rg -n 'os\\.(environ|getenv)' --type py"
tags: fastapi, config
---
One `BaseSettings` subclass (from `pydantic_settings`) declares and types every variable; `SecretStr` for secrets. Expose it through a cached `get_settings()` dependency so tests replace it with `app.dependency_overrides`. No `os.environ` reads in routes or services.

**Incorrect:**

```python
@router.post("/charge")
def charge(body: ChargeIn):
    stripe.api_key = os.environ["STRIPE_KEY"]
```

**Correct:**

```python
class Settings(BaseSettings):
    stripe_key: SecretStr

@lru_cache
def get_settings() -> Settings:
    return Settings()

@router.post("/charge")
def charge(body: ChargeIn, settings: Settings = Depends(get_settings)):
    stripe.api_key = settings.stripe_key.get_secret_value()
```

Reference: https://fastapi.tiangolo.com/advanced/settings/
