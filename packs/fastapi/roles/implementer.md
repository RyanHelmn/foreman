# fastapi · implementer
Applies when: fastapi is a dependency
Read order: fapi-auth-router-dependency, fapi-model-input-separate, fapi-response-model, fapi-async-sync-driver, fapi-settings-pydantic

## Iron laws
- Every router carries an auth dependency unless every route on it is public. Thinking "this endpoint checks the user itself"? That is the bug.

## Deviation rules
- One `APIRouter` per domain module, included in the app; don't add routes to `main.py`.
- DB sessions come from a `yield` dependency (`get_db`), never a module-level session.
- Raise `HTTPException` (or the project's exception handlers) for client errors; never return an error dict with status 200.

## Output additions
- Routers touched and the auth dependency each carries.

## Obstacles to report
- Endpoints that mix `async def` with a sync driver already: name them; fix only the ones you own.
