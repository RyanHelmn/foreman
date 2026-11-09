---
id: fapi-auth-router-dependency
title: Put the auth dependency on the router, not on each endpoint
impact: CRITICAL
impactDescription: "the next endpoint added to the router is reachable without a session"
roles: [implementer, reviewer, security]
check: "rg -n 'APIRouter\\(' --type py"
tags: auth, fastapi
---
Declare authentication once per router with `APIRouter(dependencies=[Depends(...)])` (or on `include_router`). Endpoints that need the user object still take `user: User = Depends(current_user)`; FastAPI caches the dependency per request, so it runs once. Public routes live on a separate router. A router with no auth dependency is a finding unless every route on it is meant to be public.

**Incorrect (each endpoint remembers; `export` forgot):**

```python
router = APIRouter(prefix="/invoices")

@router.get("/{invoice_id}")
async def get_invoice(invoice_id: int, user: User = Depends(current_user)): ...

@router.get("/export")
async def export_invoices(): ...
```

**Correct:**

```python
router = APIRouter(prefix="/invoices", dependencies=[Depends(current_user)])
```

Reference: https://fastapi.tiangolo.com/tutorial/bigger-applications/#another-module-with-apirouter
