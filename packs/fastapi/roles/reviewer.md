# fastapi · reviewer
Applies when: fastapi is a dependency
Read order: fapi-auth-router-dependency, fapi-model-input-separate, fapi-response-model, fapi-async-sync-driver, fapi-settings-pydantic

## Blocker vs should-fix
- Blocker: a router or endpoint without an auth dependency that should have one; an endpoint returning a DB object with no `response_model`/return annotation; a body model containing owner, role or status fields.
- Should-fix: `async def` calling a sync driver; `os.environ` outside the settings class; a test that edits `app.dependency_overrides` without clearing it.
